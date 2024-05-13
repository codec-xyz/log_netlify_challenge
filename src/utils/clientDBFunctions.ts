import { useCallback, useMemo, useSyncExternalStore } from "react";
import { TagId, Log, LogEntry, LogEntryId, addLogEntry, removeLogEntry, Workspace, PropertyInfo, Tag, PropertyId, makeTagGraph, LogProperty_Time } from "./dataSchema";
import { SampleWorkspace001 } from "./sampleData";
import { ClientDB, LogQuerier, addLogToLog, assureLogQuerier, getAllEssentials_makeRequestData, getAllEssentials_saveResponse, getLogs_makeRequestData, getLogs_saveResponse, setMyWorkspace_makeRequestData, setMyWorkspace_saveResponse, updateLogs_makeRequestData_clearChanges, updateLogs_saveResponse, updateMyTagsAndProperties_makeRequestData_clearChanges, updateMyTagsAndProperties_saveResponse } from "./clientDB";
import _ from "lodash";
import { PopulateClientDBOnLoad, SyncModeAddress, deleteCookie, getCookie, isLocalStorageEnabled, localStorage_addToLog, localStorage_deleteProp, localStorage_deleteTag, localStorage_getLog, localStorage_removeFromLog, localStorage_setLog, localStorage_setProp, localStorage_setTag, localStorage_setWorkspace, setCookie, setLocalStorageMode } from "./localStorageDB";
import { api, trpc } from "~/trpc/react";

export enum SyncMode {
	Offline,
	Normal,
	Frequent,
}

const debounce = 1000;
const maxDataAge = 3 * 60 * 60 * 1000;
const maxLiveDataAge = 5 * 60 * 1000;

const clearUnsedLogsAfter = 30 * 60 * 1000;

let syncModeWatchers: Set<() => void> = new Set();

function syncModeSubscribe(callback: () => void) {
	syncModeWatchers.add(callback);
	return () => { syncModeWatchers.delete(callback); }
}

const syncModeSnapshot = () => syncMode;
const serverSyncModeSnapshot = () => 1;
export function useSyncMode() {
	return useSyncExternalStore(syncModeSubscribe, syncModeSnapshot, serverSyncModeSnapshot);
}

export function setSyncMode(db: ClientDB, mode: SyncMode) {
	const switchBackOn = syncMode == SyncMode.Offline && mode != SyncMode.Offline;

	syncMode = mode;

	if(syncMode == SyncMode.Offline) {
		setCookie('LogSyncMode', 'Offline');
		localStorage.setItem(SyncModeAddress, 'Offline');
	}
	else if(syncMode == SyncMode.Normal) {
		deleteCookie('LogSyncMode');
		localStorage.removeItem(SyncModeAddress);
	}
	else if(syncMode == SyncMode.Frequent) {
		setCookie('LogSyncMode', 'Frequent');
		localStorage.setItem(SyncModeAddress, 'Frequent');
	}

	if(syncMode == SyncMode.Offline) setLocalStorageMode(true);

	syncModeWatchers.forEach((_, fn) => fn());

	if(switchBackOn) {
		const requestData = getAllEssentials_makeRequestData(db);
		trpc.db.getAllEssentials.query(requestData)
		.then(r => {
			if(r.userDoesNotExist) {
				trpc.db.initUserData.mutate().then(() => {
					trpc.db.getAllEssentials.query(requestData)
					.then(r => {
						getAllEssentials_saveResponse(db, r as any);
						PopulateClientDBOnLoad(db);
					});
				});
			}
			else {
				getAllEssentials_saveResponse(db, r as any);
				PopulateClientDBOnLoad(db);
			}
		});
	}
}

export let syncMode = SyncMode.Normal;
if(typeof window !== 'undefined') {
	const syncModeStoredValue = isLocalStorageEnabled() ? localStorage.getItem(SyncModeAddress) ?? 'Normal' : 'Normal';
	if(syncModeStoredValue == 'Offline') syncMode = SyncMode.Offline;
	else if(syncModeStoredValue == 'Normal') syncMode = SyncMode.Normal;
	else if(syncModeStoredValue == 'Frequent') syncMode = SyncMode.Frequent;
	setSyncMode(null as any, syncMode);

	window.onbeforeunload = function(e) {
		if (debounceUpdate != undefined) return 'Dialog text here.';
	};
}

if(typeof window !== 'undefined') runClient();
function runClient() {
	
}

let debounceUpdate: number | NodeJS.Timeout | undefined = undefined;

let pending = false;

export function makeCalls(db: ClientDB) {

	if(syncMode == SyncMode.Offline) return;

	//////////////////////////////////////////////
	if(!pending) {
		let updateLogsRequest = updateLogs_makeRequestData_clearChanges(db);
		if(updateLogsRequest.setLogs.length > 0) {
			pending = true;
			trpc.db.updateLogs.mutate(updateLogsRequest)
			.then(r => {
				pending = false;
				updateLogs_saveResponse(db, r as any);
				updateLogsRequest.setLogs.forEach(log => {
					db.log_RequestPendings.delete(log.id);
				});
			})
			.catch(e => {
				pending = false;
				updateLogsRequest.setLogs.forEach(log => {
					db.log_RequestPendings.delete(log.id);
					db.log_RequestErrors.set(log.id, { message: e.message ?? "" });
				});
			});
		}
	}

	//////////////////////////////////////////////

	if(!pending) {
		let getLogRequestInfo = [...db.logs.values()]
		.filter(log => log.needsUpdate
			&& !db.log_RequestPendings.has(log.log.id)
			&& !db.log_RequestErrors.has(log.log.id)
		)
		.map(log => {
			let needStartTime = Number.MIN_VALUE;
			let needEndTime = Number.MAX_VALUE;

			log.watchers.forEach(w => {
				needStartTime = Math.max(needStartTime, w.startTime ?? Number.MIN_VALUE);
				needEndTime = Math.min(needEndTime, w.endTime ?? Number.MAX_VALUE);
			});

			log.needsUpdate = false;
			db.log_RequestPendings.set(log.log.id, {});

			return {
				id: log.log.id,
				startTime: needStartTime,
				endTime: needEndTime,
			};
		});

		if(getLogRequestInfo.length > 0) {
			let getLogRequest = getLogs_makeRequestData(db, getLogRequestInfo);
			if(getLogRequest.logs.length > 0) {
				pending = true;
				trpc.db.getLogs.query(getLogRequest)
				.then(r => {
					pending = false;
					getLogs_saveResponse(db, r as any);
					getLogRequestInfo.forEach(log => {
						db.log_RequestPendings.delete(log.id);
					});
				})
				.catch(e => {
					pending = false;
					getLogRequestInfo.forEach(log => {
						db.log_RequestPendings.delete(log.id);
						db.log_RequestErrors.set(log.id, { message: e.message ?? "" });
					});
				});
			}
		}
	}

	//////////////////////////////////////////////

	if(!pending) {
		if(db.workspaceHasUpdate && !db.workspaceSetPending && !db.workspaceSetError) {
			db.workspaceHasUpdate = false;
			db.workspaceSetPending = true;
			let setMyWorkspaceRequest = setMyWorkspace_makeRequestData(db);
			pending = true;
			trpc.db.setMyWorkspace.mutate(setMyWorkspaceRequest)
			.then(r => {
				pending = false;
				setMyWorkspace_saveResponse(db, r);
				db.workspaceSetPending = false;
			})
			.catch(e => {
				pending = false;
				db.workspaceSetPending = false;
				db.workspaceSetError = true;
			});
		}
	}

	//////////////////////////////////////////////

	if(!pending) {
		if((db.deletedProperties.size > 0 || db.deletedTags.size > 0
		|| db.updatedProperties.size > 0  || db.updatedTags.size > 0
		) && !db.tagsAndPropertiesSetPending && !db.tagsAndPropertiesSetError) {
			db.workspaceSetPending = true;
			let updateMyTagsAndPropertiesRequest = updateMyTagsAndProperties_makeRequestData_clearChanges(db);
			pending = true;
			trpc.db.updateMyTagsAndProperties.mutate(updateMyTagsAndPropertiesRequest)
			.then(r => {
				pending = false;
				updateMyTagsAndProperties_saveResponse(db, r as any);
				db.tagsAndPropertiesSetPending = false;
			})
			.catch(e => {
				pending = false;
				db.tagsAndPropertiesSetPending = false;
				db.tagsAndPropertiesSetError = true;
			});
		}
	}

	if(pending) scheduleUpdate(db);
}

export function scheduleUpdate(db: ClientDB) {
	if(syncMode == SyncMode.Offline) return;
	if(debounceUpdate != undefined) clearTimeout(debounceUpdate);
	debounceUpdate = setTimeout(() => {
		debounceUpdate = undefined;
		makeCalls(db);
	}, debounce);
}

function isLogQuerierDataExpired(logQuerier: LogQuerier) {
	const now = new Date().getTime();
	if(syncMode == SyncMode.Normal) return (now - logQuerier.lastUpdateVersion) > maxDataAge;
	if(syncMode == SyncMode.Frequent) return (now - logQuerier.lastUpdateVersion) > maxLiveDataAge;
	return false;
}

function proccessLogQuerierWatchersUpdate(db: ClientDB, tagId: TagId) {
	const logQuerier = db.logs.get(tagId);
	if(logQuerier == undefined) return;
	if(db.log_RequestPendings.has(tagId) || db.log_RequestErrors.has(tagId)) return;

	let needStartTime = Number.MIN_VALUE;
	let needEndTime = Number.MAX_VALUE;

	logQuerier.watchers.forEach(w => {
		needStartTime = Math.max(needStartTime, w.startTime ?? Number.MIN_VALUE);
		needEndTime = Math.min(needEndTime, w.startTime ?? Number.MAX_VALUE);
	});

	if(needStartTime < logQuerier.startTime || needEndTime > logQuerier.endTime) {
		if(!logQuerier.needsUpdate) scheduleUpdate(db);
		logQuerier.needsUpdate = true;

		const log = localStorage_getLog(tagId);
		log.entries = log.entries.filter(e => needStartTime <= e[LogProperty_Time] && e[LogProperty_Time] <= needEndTime);
		addLogToLog(logQuerier.log, log);

		logQuerier.log = _.cloneDeep(logQuerier.log);
		logQuerier.watchers.forEach((_, fn) => fn());
	}
}

export function retryLogServerUpdate(db: ClientDB, tagId: TagId) {
	if(db.log_RequestPendings.has(tagId)) return;
	db.log_RequestErrors.delete(tagId);
	proccessLogQuerierWatchersUpdate(db, tagId);
}

function logSubscribe(db: ClientDB, tagId: TagId, startTime: number | undefined, endTime: number | undefined) {
	return (callback: () => void) => {
		const logQuerier = assureLogQuerier(db, tagId);
		logQuerier.watchers.set(callback, { startTime, endTime });

		proccessLogQuerierWatchersUpdate(db, tagId);

		return () => {
			logQuerier.watchers.delete(callback);

			proccessLogQuerierWatchersUpdate(db, tagId);
		}
	}
}

export type LogQuery = {
	hasSomeData: boolean,
	hasFullData: boolean,
	isServerLoading: boolean,
	isServerError: boolean,
	isServerErrorMessage: string,
	data: Log,
};

function logSnapshot(db: ClientDB, tagId: TagId) {
	return () => {
		const logQuerier = assureLogQuerier(db, tagId);
		return logQuerier.log;
	};
	// return (): LogQuery => {
	// 	const logQuerier = assureLogQuerier(db, tagId);
	// 	const isExpired = isLogQuerierDataExpired(logQuerier);
	// 	const serverRequestPending = db.log_RequestPendings.get(tagId);
	// 	const serverRequestError = db.log_RequestErrors.get(tagId);
	// 	const isServerLoading = serverRequestPending != undefined;
	// 	const isServerError = serverRequestError != undefined;
	// 	return {
	// 		hasSomeData: logQuerier.lastUpdateVersion != 0,
	// 		hasFullData: logQuerier.lastUpdateVersion != 0 && !isExpired && !isServerLoading && !isServerError,
	// 		isServerLoading: isServerLoading,
	// 		isServerError: isServerError,
	// 		isServerErrorMessage: serverRequestError?.message ?? "",
	// 		data: logQuerier.log,
	// 	};
	// }
}

function logServerSnapshot(db: ClientDB, tagId: TagId) {
	return () => {
		const logQuerier = assureLogQuerier(db, tagId);
		return logQuerier.log;
	};
	// return () => {
	// 	const logQuerier = assureLogQuerier(db, tagId);
	// 	return {
	// 		hasSomeData: logQuerier.lastUpdateVersion != 0,
	// 		hasFullData: logQuerier.lastUpdateVersion != 0,
	// 		isServerLoading: false,
	// 		isServerError: false,
	// 		isServerErrorMessage: "",
	// 		data: logQuerier.log,
	// 	}
	// }
}

export function useDatabaseLog(db: ClientDB, tag: TagId, startTime?: number, endTime?: number) {
	const subscribe = useCallback(logSubscribe(db, tag, startTime, endTime), [db, tag, startTime, endTime]);
	const snapshot = useCallback(logSnapshot(db, tag), [db, tag]);
	const serverSnapshot = useCallback(logServerSnapshot(db, tag), [db, tag]);
	return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function addToLog(db: ClientDB, tagId: TagId, entry: LogEntry) {
	if(tagId == undefined || tagId === '') return;
	entry = _.cloneDeep(entry);
	const logQuerier = assureLogQuerier(db, tagId);
	logQuerier.log.version = entry.version = new Date().getTime();
	addLogEntry(logQuerier.log.entries, entry);

	localStorage_addToLog(tagId, entry);
	logQuerier.deleteEntries.delete(entry.id);
	logQuerier.setEntries.set(entry.id, entry);
	
	logQuerier.log = _.cloneDeep(logQuerier.log);
	logQuerier.watchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}

export function removeFromLog(db: ClientDB, tagId: TagId, entryId: LogEntryId) {
	if(tagId == undefined || tagId === '') return;
	const logQuerier = assureLogQuerier(db, tagId);
	logQuerier.log.version = new Date().getTime();
	removeLogEntry(logQuerier.log.entries, entryId);

	localStorage_removeFromLog(tagId, entryId, logQuerier.log.version);
	logQuerier.deleteEntries.set(entryId, logQuerier.log.version);
	logQuerier.setEntries.delete(entryId);

	logQuerier.log = _.cloneDeep(logQuerier.log);
	logQuerier.watchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}

export function setLog(db: ClientDB, tagId: TagId, entries: LogEntry[]) {
	if(tagId == undefined || tagId === '') return;
	entries = _.cloneDeep(entries);
	const logQuerier = assureLogQuerier(db, tagId);
	logQuerier.log.version = new Date().getTime();
	entries.forEach(e => {
		e.version = logQuerier.log.version;
	});
	logQuerier.log.entries = entries;

	localStorage_setLog(tagId, entries, logQuerier.log.version);
	logQuerier.deleteEntries.clear();
	logQuerier.setEntries = new Map(entries.map(e => [e.id, e]));
	logQuerier.deleteAllEntries = logQuerier.log.version;
	
	logQuerier.log = _.cloneDeep(logQuerier.log);
	logQuerier.watchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}

function workspaceSubscribe(db: ClientDB) {
	return (callback: () => void) => {
		db.workspaceWatchers.add(callback);

		return () => {
			db.workspaceWatchers.delete(callback);
		}
	}
}

function workspaceSnapshot(db: ClientDB) {
	return () => db.userData.workspace;
}

function workspaceServerSnapshot(db: ClientDB) {
	return () => db.userData.workspace;
}

export function useDatabaseWorkspace(db: ClientDB) {
	const subscribe = useCallback(workspaceSubscribe(db), [db]);
	const snapshot = useCallback(workspaceSnapshot(db), [db]);
	const serverSnapshot = useCallback(workspaceServerSnapshot(db), [db]);
	return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function setWorkspace(db: ClientDB, workspace: Workspace) {
	workspace = _.cloneDeep(workspace);
	db.userData.version = Math.max(db.userData.version, workspace.version);
	db.userData.workspace = workspace;
	
	localStorage_setWorkspace(workspace);
	db.workspaceHasUpdate = true;
	
	db.userData.workspace = _.cloneDeep(db.userData.workspace);
	db.workspaceWatchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}

export function setProp(db: ClientDB, prop: PropertyInfo) {
	prop = _.cloneDeep(prop);
	db.userData.version = prop.version = new Date().getTime();
	let index = db.userData.properties.findIndex(a => a.id == prop.id);
	if(index == -1) db.userData.properties.push(prop);
	else db.userData.properties[index] = prop;
	
	localStorage_setProp(prop);
	db.updatedProperties.add(prop.id);

	db.propsAndTagsWatchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}

export function deleteProp(db: ClientDB, propId: PropertyId) {
	db.userData.version = new Date().getTime();
	db.userData.properties = db.userData.properties.filter(a => a.id != propId);

	localStorage_deleteProp(propId, db.userData.version);
	db.deletedProperties.add(propId);

	db.propsAndTagsWatchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}

export function setTag(db: ClientDB, tag: Tag) {
	tag = _.cloneDeep(tag);
	db.userData.version = tag.version = new Date().getTime();
	let index = db.userData.tags.findIndex(a => a.id == tag.id);
	if(index == -1) db.userData.tags.push(tag);
	else db.userData.tags[index] = tag;

	localStorage_setTag(tag);
	db.updatedTags.add(tag.id);

	db.tagGraph = makeTagGraph([...db.userData.tags, ...Array.from(db.sharedWithMeTags).map(a => a[1])]);
	db.propsAndTagsWatchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}

export function deleteTag(db: ClientDB, tagId: TagId) {
	db.userData.version = new Date().getTime();
	db.userData.tags = db.userData.tags.filter(a => a.id != tagId);

	localStorage_deleteTag(tagId, db.userData.version);
	db.deletedTags.add(tagId);

	db.tagGraph = makeTagGraph([...db.userData.tags, ...Array.from(db.sharedWithMeTags).map(a => a[1])]);
	db.propsAndTagsWatchers.forEach((_, fn) => fn());

	scheduleUpdate(db);
}