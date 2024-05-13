import { getStore } from '@netlify/blobs';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { ExArr } from '~/utils/ExArr';
import { Log, LogEntry, LogProperty_Time, PropertyId, PropertyInfo, Tag, TagId, UserData, View, ViewPage, Workspace, addLogEntry, calcThisAndAllParentTagIds, makeTagGraph } from '~/utils/dataSchema';
import { nanoid } from 'nanoid'
import _ from 'lodash';

const userStoreInfo = { name: 'user', consistency: 'strong' as ('eventual' | 'strong') };
const logStoreInfo = { name: 'log', consistency: 'strong' as ('eventual' | 'strong') };

function makeDefaultUserData(): UserData {
	return {
		version: 1,
		workspace: {
			version: 1,
			theme: 'system',
			viewPages: [],
		},
		tags: [],
		properties: [],
		sharedTags: [],
	}
}

export type getAllEssentials_returnType = {
	userDoesNotExist: boolean,
	userData?: UserData,
	propertyInfos: Map<PropertyId, PropertyInfo>,
	tags: Map<TagId, Tag>,
};

function isVersionValid(globalMaxVersion: number, curVersion: number | undefined, newVersion: number): boolean {
	if(newVersion == 0) return false;
	return newVersion > globalMaxVersion || newVersion == (curVersion ?? 0);
}

function mergeVersionedArrays<T extends { version: number, id: string }>(serverArr: T[], clientArr: T[], lastKnownVersion: number, merge: (server: T, client: T) => T): T[] {
	serverArr = serverArr.filter(a => {
		const clientA = clientArr.find(p => p.id == a.id);
		return clientA || a.version > lastKnownVersion;
	});

	clientArr.forEach(a => {
		const serverIndex = serverArr.findIndex(p => p.id == a.id);
		if(serverIndex == -1) {
			serverArr.push(a);
			return;
		}

		serverArr[serverIndex] = merge(serverArr[serverIndex]!, a);
	});

	return serverArr;
}

export const dbRouter = createTRPCRouter({
	getAllEssentials: protectedProcedure
		.input(z.object({
			userVersion: z.number(),
			sharedPropertyInfoVersions: z.map(z.string(), z.number()),
			sharedTagVersions: z.map(z.string(), z.number()),
		})).query(async ({ ctx, input }): Promise<getAllEssentials_returnType> => {
			const userStore = getStore(userStoreInfo);
			const thisUser = await userStore.get(ctx.userId, { type: "json" }) as UserData;
			if(thisUser == undefined) return { userDoesNotExist: true, propertyInfos: new Map(), tags: new Map() };
			const otherUsers = (await Promise.all(thisUser.sharedTags.map(a => userStore.get(a.user, { type: "json" }))))
			.filter(a => a != undefined) as UserData[];

			const allProps = new Map([thisUser, ...otherUsers].flatMap(a => a.properties).map(a => [a.id, a]));
			const graph = makeTagGraph([thisUser, ...otherUsers].flatMap(a => a.tags));

			const myTagIds = new Set(thisUser.tags.map(a => a.id));
			const myPropIds = new Set(thisUser.properties.map(a => a.id));

			const finalSharedTags = thisUser.sharedTags.flatMap(a => a.tags)
			.filter(tagId => graph.get(tagId)?.tag?.viewers?.includes(ctx.userId) === true)
			.flatMap(tagId => Array.from(calcThisAndAllParentTagIds(graph, tagId)))
			.filter(tagId => !myTagIds.has(tagId))
			.map(tagId => graph.get(tagId)!.tag)
			.filter(tag => {
				const expectVersion = input.sharedTagVersions.get(tag.id);
				return expectVersion == undefined || tag.version > expectVersion
			});

			const finalSharedProps = finalSharedTags.flatMap(tag => tag.properties)
			.filter(propId => !myPropIds.has(propId))
			.map(propId => allProps.get(propId)!)
			.filter(prop => {
				const expectVersion = input.sharedTagVersions.get(prop.id);
				return expectVersion == undefined || prop.version > expectVersion
			});

			return {
				userData: thisUser.version > input.userVersion ? thisUser : undefined,
				userDoesNotExist: false,
				propertyInfos: new Map(finalSharedProps.map(a => [a.id, a])),
				tags: new Map(finalSharedTags.map(a => [a.id, a])),
			};
		}),
	getLogs: protectedProcedure
		.input(z.object({
			logs: z.array(z.object({
				id: z.string(),
				version: z.number(),
				startTime: z.number(),
				endTime: z.number(),
			})),
		})).query(async ({ ctx, input }): Promise<{
			logs: Map<TagId, { startTime: number, endTime: number, log: Log}>,
		}> => {
			const userStore = getStore(userStoreInfo);
			const logStore = getStore(logStoreInfo);
			const thisUser = await userStore.get(ctx.userId, { type: "json" }) as UserData;
			if(thisUser == undefined) throw new TRPCError({ message: 'User not found', code: "NOT_FOUND" });

			const accessibleTags = new Set([...thisUser.tags.map(a => a.id), ...thisUser.sharedTags.flatMap(a => a.tags)]);
			const queryLogsInfo = input.logs.filter(log => accessibleTags.has(log.id));
			const queryLogsInfoLookup = ExArr.use(queryLogsInfo).makeLookup(a => a.id);
			const logs = await Promise.all(queryLogsInfo.map(log => logStore.get(log.id, { type: 'json' }))) as Log[];

			const filteredLogs = logs.filter(log => log != undefined && log.version > queryLogsInfoLookup[log.id]!.version)
			.map(log => {
				const info = queryLogsInfoLookup[log.id]!;
				const startTime = info.startTime;
				const endTime = info.endTime;
				return {
					startTime,
					endTime,
					log: {
						version: log.version,
						id: log.id,
						entries: log.entries.filter(e => startTime <= e[LogProperty_Time] && e[LogProperty_Time] <= endTime),
					} as Log,
				}
			});

			return { logs: new Map(filteredLogs.map(a => [a.log.id, a])) };
		}),
	initUserData: protectedProcedure
		.mutation(async ({ ctx, input }) => {
			const userStore = getStore(userStoreInfo);
			const thisUser = await userStore.get(ctx.userId, { type: "json" }) as UserData;
			if(thisUser != undefined) throw new TRPCError({ code: "BAD_REQUEST" });
			await userStore.setJSON(ctx.userId, makeDefaultUserData());
		}),
	setMyWorkspace: protectedProcedure
		.input(z.object({
			lastUpdateVersion: z.number(),
			workspace: z.object({
				version: z.number(),
				theme: z.string(),
				viewPages: z.array(z.object({
					version: z.number(),
					id: z.string(),
					name: z.string(),
					views: z.array(z.object({
						version: z.number(),
						id: z.string(),
						type: z.number(),
						info: z.any(),
					})),
				})),
			}),
		})).mutation(async ({ ctx, input }): Promise<{
			workspace?: Workspace,
		}> => {
			const userStore = getStore(userStoreInfo);
			const thisUser = await userStore.get(ctx.userId, { type: "json" }) as UserData;
			if(thisUser == undefined) throw new TRPCError({ code: "NOT_FOUND" });
			const needsUpdate = thisUser.workspace.version > input.lastUpdateVersion;

			thisUser.version = Math.max(thisUser.version, input.workspace.version);

			if(input.workspace.version >= thisUser.workspace.version) thisUser.workspace = input.workspace as Workspace;

			// const server = thisUser.workspace;
			// const client = input.workspace;

			// if(server.version <= client.version) {
			// 	server.version = client.version;
			// 	server.theme = client.theme;
			// }

			// server.viewPages = mergeVersionedArrays(server.viewPages, client.viewPages, input.lastUpdateVersion, (server, client) => {
			// 	if(server.version <= client.version) {
			// 		server.version = client.version;
			// 		server.name = client.name;
			// 	}

			// 	server.views = mergeVersionedArrays(server.views, client.views, input.lastUpdateVersion, (server, client) => {
			// 		if(server.version <= client.version) {
			// 			server.version = client.version;
			// 			server.type = client.type;
			// 			server.info = client.info;
			// 		}

			// 		return server;
					
			// 	});

			// 	return server;
			// }) as ViewPage[];

			await userStore.setJSON(ctx.userId, thisUser);

			return {
				workspace: needsUpdate ? thisUser.workspace : undefined,
			};
		}),
	updateMyTagsAndProperties: protectedProcedure
		.input(z.object({
			setPropertyInfos: z.array(z.object({
				version: z.number(),
				id: z.string(),
				name: z.string(),
				type: z.number(),
				typeSettings: z.any().optional(),
			})),
			setTags: z.array(z.object({
				version: z.number(),
				id: z.string(),
				name: z.string(),
				tags: z.array(z.string()),

				properties: z.array(z.string()),

				viewers: z.array(z.string()),
				logEditors: z.array(z.string()),
			})),
			deletePropertyInfos: z.set(z.string()),
			deleteTags: z.set(z.string()),
		})).mutation(async ({ ctx, input }): Promise<{
			propertyInfos: PropertyInfo[],
			tags: Tag[],
		}> => {
			const userStore = getStore(userStoreInfo);
			const thisUser = await userStore.get(ctx.userId, { type: "json" }) as UserData;
			if(thisUser == undefined) throw new TRPCError({ message: 'User not found', code: "NOT_FOUND" });

			const shareChanges: Map<string, {
				addTags: Set<TagId>,
				removeTags: Set<TagId>,
			}> = new Map();

			const hadProps = new Map(thisUser.properties.map(a => [a.id, a]));
			const hadTags = new Map(thisUser.tags.map(a => [a.id, a]));

			const response = { propertyInfos: new Map(), tags: new Map() };

			input.setPropertyInfos.filter(prop => {
				const split = prop.id.split('+');
				const validId = split.length == 2 || split[0] == ctx.userId;
				return validId;
			})
			.forEach(prop => {
				const existingProp = hadProps.get(prop.id);
				if(existingProp == undefined) {
					thisUser.properties.push(prop);
					return;
				}

				if(existingProp.version > prop.version) {
					response.propertyInfos.set(existingProp.id, existingProp);
					return;
				}

				existingProp.version = prop.version;
				existingProp.name = prop.name;
				existingProp.type = prop.type;
				existingProp.typeSettings = prop.typeSettings;
			});

			input.setTags.filter(tag => {
				const split = tag.id.split('+');
				const validId = split.length == 2 || split[0] == ctx.userId;
				return validId;
			})
			.forEach(tag => {
				const existingTag = hadTags.get(tag.id);
				if(existingTag == undefined) {
					thisUser.tags.push(tag);
					return;
				}

				if(existingTag.version > tag.version) {
					response.tags.set(existingTag.id, existingTag);
					return;
				}

				existingTag.version = tag.version;
				existingTag.name = tag.name;
				existingTag.tags = tag.tags;
				existingTag.properties = tag.properties;

				let corrections = false;
				if(new Set(tag.viewers).size != tag.viewers.length
				|| new Set(tag.logEditors).size != tag.logEditors.length
				|| _.difference(tag.logEditors, tag.viewers).length != 0) corrections = true;

				tag.viewers = Array.from(new Set([...tag.viewers, ...tag.logEditors]));
				tag.logEditors = Array.from(new Set(tag.logEditors));

				const addUsers = _.difference([...tag.viewers, ...tag.logEditors], [...existingTag.viewers, ...existingTag.logEditors]);
				const removedUsers = _.difference([...existingTag.viewers, ...existingTag.logEditors], [...tag.viewers, ...tag.logEditors]);

				addUsers.forEach(userId => {
					let userUpdates = shareChanges.get(userId);
					if(!userUpdates) shareChanges.set(userId, {
						addTags: new Set([tag.id]),
						removeTags: new Set(),
					});
					else {
						userUpdates.addTags.add(tag.id);
						userUpdates.removeTags.delete(tag.id);
					}
				});

				removedUsers.forEach(userId => {
					let userUpdates = shareChanges.get(userId);
					if(!userUpdates) shareChanges.set(userId, {
						addTags: new Set(),
						removeTags: new Set([tag.id]),
					});
					else {
						userUpdates.addTags.delete(tag.id);
						userUpdates.removeTags.add(tag.id);
					}
				});

				existingTag.viewers = tag.viewers;
				existingTag.logEditors = tag.logEditors;

				if(corrections) response.tags.set(existingTag.id, existingTag); 
			});

			thisUser.properties = thisUser.properties.filter(prop => !input.deletePropertyInfos.has(prop.id));
			thisUser.tags = thisUser.tags.filter(tag => {
				const keepTag = !input.deleteTags.has(tag.id);
				if(!keepTag) {
					[...tag.viewers, ...tag.logEditors].forEach(userId => {
						let userUpdates = shareChanges.get(userId);
						if(!userUpdates) shareChanges.set(userId, {
							addTags: new Set(),
							removeTags: new Set([tag.id]),
						});
						else {
							userUpdates.addTags.delete(tag.id);
							userUpdates.removeTags.add(tag.id);
						}
					});
				}
				return keepTag;
			});

			shareChanges.forEach((a, id) => {
				if(a.addTags.size == 0 && a.removeTags.size == 0) shareChanges.delete(id);
			});

			const otherUserIds = [...shareChanges.keys()];
			const otherUsers = new Map(
				(await Promise.all(otherUserIds.map(userId => userStore.get(userId, { type: "json" }))) as UserData[])
				.map((userData, i) => [otherUserIds[i]!, userData])
				.filter(a => a[1] != undefined) as [string, UserData][]
			);

			shareChanges.forEach((change, userId) => {
				const otherUser = otherUsers.get(userId);
				if(!otherUser) return;

				let share = otherUser.sharedTags.find(a => a.user == ctx.userId);
				if(!share) otherUser.sharedTags.push(share = { user: ctx.userId, tags: [] });
				share.tags.push(...change.addTags);
				share.tags.filter(tagId => !change.removeTags.has(tagId));
				share.tags = Array.from(new Set(share.tags));

				if(share.tags.length == 0) otherUser.sharedTags = otherUser.sharedTags.filter(share => share.user != ctx.userId);

				otherUser.version = new Date().getTime();
			});

			[...shareChanges.entries()].filter(a => !otherUsers.has(a[0]))
			.forEach(a => {
				const userId = a[0];
				const change = a[1];

				[...change.addTags].forEach(tagId => {
					const tag = thisUser.tags.find(tag => tag.id == tagId)!;
					response.tags.set(tagId, tag);
					tag.viewers = tag.viewers.filter(u => u != userId);
					tag.logEditors = tag.logEditors.filter(u => u != userId);
				});
			});

			console.log("tagsAndProps", thisUser);

			await Promise.all([userStore.setJSON(ctx.userId, thisUser), ...[...otherUsers.entries()].map(user => userStore.setJSON(user[0], user[1]))]);

			return {
				propertyInfos: [...response.propertyInfos.values()],
				tags: [...response.tags.values()],
			};
		}),
	updateLogs: protectedProcedure
		.input(z.object({
			setLogs: z.array(z.object({
				lastUpdateVersion: z.number(),
				version: z.number(),
				id: z.string(),
				startTime: z.number(),
				endTime: z.number(),

				deleteAllEntries: z.number(),
				setEntries: z.map(z.string(), z.object({
					version: z.number(),
					id: z.string(),
					data: z.record(z.string(), z.any()),
				})),
				deleteEntries: z.map(z.string(), z.number()),
			})),
		})).mutation(async ({ ctx, input }): Promise<{
			logs: Map<TagId, Log>, //returns unknown changes based on version
		}> => {
			const userStore = getStore(userStoreInfo);
			const logStore = getStore(logStoreInfo);
			const thisUser = await userStore.get(ctx.userId, { type: "json" }) as UserData;
			if(thisUser == undefined) throw new TRPCError({ message: 'User not found', code: "NOT_FOUND" });

			const tagOwner = new Map(
				thisUser.sharedTags.flatMap(a => a.tags.map(tagId => ({ userId: a.user, tagId })))
				.map(a => [a.tagId, a.userId])
			);
			const needUsers = new Set(input.setLogs.map(a => tagOwner.get(a.id)).filter(a => a != undefined && a != '')) as Set<string>;
			const otherUsers = (await Promise.all(Array.from(needUsers).map(userId => userStore.get(userId, { type: "json" }))))
			.filter(a => a != undefined) as any as UserData[];

			const myTags = new Map(thisUser.tags.map(tag => [tag.id, tag]));
			const sharedTags = new Map(otherUsers.flatMap(a => a.tags).map(tag => [tag.id, tag]));
			const editableLogs = input.setLogs.filter(setLog => 
				myTags.has(setLog.id) || sharedTags.get(setLog.id)?.logEditors?.includes(ctx.userId) === true
			);

			const logs = (await Promise.all(editableLogs.map(log => logStore.get(log.id, { type: "json" })))) as Log[];
			const zippedLogs = editableLogs.map((setLog, i) => {
				return {
					log: logs[i] ?? {
						version: 0,
						id: setLog.id,
						entries: [],
					},
					setLog: setLog, id: setLog.id
				}
			});

			const response: { logs: Map<TagId, Log> } = { logs: new Map() };

			zippedLogs.forEach(log => {
				log.log.version = Math.max(log.log.version, log.setLog.version);

				log.log.entries = log.log.entries.filter(e =>
					e.version > Math.max((log.setLog.deleteEntries.get(e.id) ?? 0), log.setLog.deleteAllEntries)
				);

				log.setLog.setEntries.forEach(entry => {
					entry.data.id = entry.id;
					entry.data.version = entry.version;
					addLogEntry(log.log.entries, entry.data as LogEntry);
				});

				if(log.log.version > log.setLog.lastUpdateVersion) {
					response.logs.set(log.log.id, {
						version: log.log.version,
						id: log.log.id,
						entries: log.log.entries.filter(e => e.version > log.setLog.lastUpdateVersion
							&& log.setLog.startTime <= e[LogProperty_Time] && e[LogProperty_Time] <= log.setLog.endTime
						),
					});
				}
			});

			const updatedLogs = zippedLogs.filter(log => log.log.entries.length > 0);
			const deletedLogs = zippedLogs.filter(log => log.log.entries.length == 0);

			await Promise.all([
				...updatedLogs.map(log => logStore.setJSON(log.id, log.log)),
				...deletedLogs.map(log => logStore.delete(log.id)),
			]);

			return response;
		}),
});