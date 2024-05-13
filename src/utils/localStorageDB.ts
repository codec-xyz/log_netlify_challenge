import _ from "lodash";
import { ClientDB, assureLogQuerier } from "./clientDB";
import { TagId, LogEntry, addLogEntry, LogEntryId, removeLogEntry, Log, Workspace, PropertyInfo, Tag, UserData, PropertyId } from "./dataSchema";
import { useSyncExternalStore } from "react";
import { scheduleUpdate } from "./clientDBFunctions";

export function setCookie(name: string, value: string) {
	window.document.cookie = `${name}=${value};path=/`;
}

export function getCookie(name: string) {
	const value = `; ${window.document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts[1]!.split(';')[0]!;
	return undefined;
}

export function hasCookie(name: string) {
	const value = `; ${window.document.cookie}`;
	const parts = value.split(`; ${name}=`);
	return parts.length === 2;
}

export function deleteCookie(name: string) {
	if(!hasCookie(name)) return;
	window.document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}

export function isLocalStorageEnabled() {
	try {
		const key = '_storage_test_NkHlLVZf7KQS6VnP';
		window.localStorage.setItem(key, '');
		window.localStorage.removeItem(key);
		return true;
	} catch (e) {
		return false;
	}
};

export const SyncModeAddress = 'LogLocalStorage_oSDNGBWk6M8UoTqDfZGqT'
const LocalStorageEnabledAddress = 'LogLocalStorage_oSDNGBWk6M8UoTqDfZGqT'
const UserStorageAddress = 'UserStorage_iVjRe3NG0gdYn7G2HRBVg';
type LocalStorageObject = {
	userEssentialsAge: number,
	userDataLastUpdateVersion: number,
	userWorkspaceLastUpdateVersion: number,
	userData: UserData,
	sharedWithMePropertyInfos: PropertyInfo[],
	sharedWithMeTags: Tag[],
	allLocalLog: TagId[],
};

let localStorageModeWatchers: Set<() => void> = new Set();

function localStorageModeSubscribe(callback: () => void) {
	localStorageModeWatchers.add(callback);
	return () => { localStorageModeWatchers.delete(callback); }
}

const localStorageModeSnapshot = () => localStorageMode;
const serverLocalStorageModeSnapshot = () => false;
export function useLocalStorageMode() {
	return useSyncExternalStore(localStorageModeSubscribe, localStorageModeSnapshot, serverLocalStorageModeSnapshot);
}

export function setLocalStorageMode(mode: boolean) {
	if(!isLocalStorageEnabled()) {
		localStorageMode = false;
		return;
	}
	localStorageMode = mode;
	if(localStorageMode == true) window.localStorage.setItem(LocalStorageEnabledAddress, 'true');
	else if(localStorageMode == false) window.localStorage.removeItem(LocalStorageEnabledAddress);

	localStorageModeWatchers.forEach((_, fn) => fn());

	if(localStorageMode == false) DeleteLocalStorageDB();
}

export let localStorageMode = false;
if(typeof window !== 'undefined') {
	localStorageMode = isLocalStorageEnabled() && localStorage.getItem(LocalStorageEnabledAddress) == 'true';
}

export function DeleteLocalStorageDB() {
	const user = getUser();
	user.allLocalLog.forEach(logAddress => localStorage.removeItem(logAddress));
	localStorage.removeItem(UserStorageAddress);
	localStorage.removeItem(LocalStorageEnabledAddress);
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

export function PopulateClientDBOnLoad(db: ClientDB) {
	if(!localStorageMode) return;

	if(db.userData.version == 0) {
		const user = getUser();
		db.userEssentialsAge = user.userEssentialsAge;
		db.userDataLastUpdateVersion = user.userDataLastUpdateVersion;
		db.userWorkspaceLastUpdateVersion = user.userWorkspaceLastUpdateVersion;
		db.userData = user.userData;
		db.sharedWithMePropertyInfos = new Map(user.sharedWithMePropertyInfos.map(a => [a.id, a]));
		db.sharedWithMeTags = new Map(user.sharedWithMeTags.map(a => [a.id, a]));
		return;
	}

	let hadUpdate = false;

	const user = getUser();

	let server = db.userData.workspace;
	let client = user.userData.workspace;

	if(server.version < client.version) {
		server.version = client.version;
		server.theme = client.theme;
		hadUpdate = true;

		[server, client] = [client, server];
	}

	server.viewPages = mergeVersionedArrays(server.viewPages, client.viewPages, client.version, (server, client) => {
		if(server.version < client.version) {
			server.version = client.version;
			server.name = client.name;
			hadUpdate = true;
		}

		server.views = mergeVersionedArrays(server.views, client.views, client.version, (server, client) => {
			if(server.version < client.version) {
				server.version = client.version;
				server.type = client.type;
				server.info = client.type;
				hadUpdate = true;
			}

			return server;
			
		});

		return server;
	});

	db.workspaceHasUpdate = hadUpdate;

	db.userData.version = user.userData.version = Math.max(db.userData.version, user.userData.version, server.version);
	db.userData.workspace = user.userData.workspace = server;

	db.userData.properties = db.userData.properties.filter(prop => {
		const userPropI = user.userData.properties.findIndex(a => a.id == prop.id);
		if(userPropI == -1 && prop.version < user.userDataLastUpdateVersion) {
			db.deletedProperties.add(prop.id);
			return false;
		}
		return true;
	});
	user.userData.properties.forEach(prop => {
		if(prop.version < user.userDataLastUpdateVersion) return;
		const dbPropI = db.userData.properties.findIndex(a => a.id == prop.id);
		if(dbPropI == -1) {
			db.userData.properties.push(prop);
			db.updatedProperties.add(prop.id);
			hadUpdate = true;
		}
		else if(db.userData.properties[dbPropI]!.version < prop.version) {
			db.userData.properties[dbPropI] = prop;
			db.updatedProperties.add(prop.id);
			hadUpdate = true;
		}
	});

	db.userData.tags = db.userData.tags.filter(tag => {
		const userTagI = user.userData.tags.findIndex(a => a.id == tag.id);
		if(userTagI == -1 && tag.version < user.userDataLastUpdateVersion) {
			db.deletedTags.add(tag.id);
			return false;
		}
		return true;
	});
	user.userData.tags.forEach(tag => {
		if(tag.version < user.userDataLastUpdateVersion) return;
		const dbTagI = db.userData.tags.findIndex(a => a.id == tag.id);
		if(dbTagI == -1) {
			db.userData.tags.push(tag);
			db.updatedTags.add(tag.id);
			hadUpdate = true;
		}
		else if(db.userData.tags[dbTagI]!.version < tag.version) {
			db.userData.tags[dbTagI] = tag;
			db.updatedTags.add(tag.id);
			hadUpdate = true;
		}
	});

	user.sharedWithMePropertyInfos = [...db.sharedWithMePropertyInfos.values()];
	user.sharedWithMeTags = [...db.sharedWithMeTags.values()];

	if(hadUpdate == true) scheduleUpdate(db);
	//db.workspaceHasUpdate = true;
	//scheduleUpdate(db);
}

function jsonSafeParse<T>(text: string | undefined | null): T | undefined {
	if(text == undefined) return undefined;
	try {
		return JSON.parse(text);
	}
	catch (e) {
		return undefined;
	}
}

function getUser(): LocalStorageObject {
	return jsonSafeParse<LocalStorageObject>(localStorage.getItem(UserStorageAddress)) ?? {
		userEssentialsAge: 0,
		userDataLastUpdateVersion: 0,
		userWorkspaceLastUpdateVersion: 0,
		userData: {
			version: 0,
			workspace: {
				version: 0,
				theme: 'system',
				viewPages: [],
			},
			tags: [],
			properties: [],
			sharedTags: [],
		},
		sharedWithMePropertyInfos: [],
		sharedWithMeTags: [],
		allLocalLog: [],
	};
}

function setUser(user: LocalStorageObject) {
	localStorage.setItem(UserStorageAddress, JSON.stringify(user));
}

export function localStorage_getLog(tagId: TagId) {
	return jsonSafeParse<Log>(localStorage.getItem(tagId)) ?? {
		version: 0,
		id: tagId,
		entries: [],
	};
}

function setLog(tagId: TagId, log: Log) {
	const user = getUser();
	const allLogSet = new Set(user.allLocalLog);

	if(log.entries.length == 0) {
		allLogSet.delete(log.id);
		localStorage.removeItem(tagId);
	}
	else {
		allLogSet.add(log.id);
		localStorage.setItem(tagId, JSON.stringify(log));
	}

	user.allLocalLog = Array.from(allLogSet);
	setUser(user);
}

export function localStorage_addToLog(tagId: TagId, entry: LogEntry) {
	if(!localStorageMode) return;

	let log = localStorage_getLog(tagId);
	log.version = Math.max(log.version, entry.version);
	addLogEntry(log.entries, entry);
	setLog(tagId, log);
}

export function localStorage_removeFromLog(tagId: TagId, entryId: LogEntryId, version: number) {
	if(!localStorageMode) return;

	let log = localStorage_getLog(tagId);
	log.version = Math.max(log.version, version);
	removeLogEntry(log.entries, entryId);
	setLog(tagId, log);
}

export function localStorage_setLog(tagId: TagId, entries: LogEntry[], version: number) {
	if(!localStorageMode) return;

	setLog(tagId, {
		version,
		id: tagId,
		entries: entries,
	});
}

export function localStorage_setWorkspace(workspace: Workspace) {
	const user = getUser();
	user.userData.version = Math.max(user.userData.version, workspace.version);
	user.userData.workspace = workspace;
	setUser(user);
}

export function localStorage_setProp(prop: PropertyInfo) {
	const user = getUser();
	user.userData.version = Math.max(user.userData.version, prop.version);
	let index = user.userData.properties.findIndex(a => a.id == prop.id);
	if(index == -1) user.userData.properties.push(prop);
	else user.userData.properties[index] = prop;
	setUser(user);
}

export function localStorage_deleteProp(propId: PropertyId, version: number) {
	const user = getUser();
	user.userData.version = Math.max(user.userData.version, version);
	user.userData.properties = user.userData.properties.filter(a => a.id != propId);
	setUser(user);
}

export function localStorage_setTag(tag: Tag) {
	const user = getUser();
	user.userData.version = Math.max(user.userData.version, tag.version);
	let index = user.userData.tags.findIndex(a => a.id == tag.id);
	if(index == -1) user.userData.tags.push(tag);
	else user.userData.tags[index] = tag;
	setUser(user);
}

export function localStorage_deleteTag(tagId: TagId, version: number) {
	const user = getUser();
	user.userData.version = Math.max(user.userData.version, version);
	user.userData.tags = user.userData.tags.filter(a => a.id != tagId);
	setUser(user);
}