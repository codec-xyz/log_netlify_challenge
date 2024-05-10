import { useCallback, useSyncExternalStore } from "react";
import { TagId, LogGroup, LogEntry } from "./dataSchema";
import { SampleLogGroups001_Queryable, SampleWorkspace001 } from "./sampleData";

let logGroups = SampleLogGroups001_Queryable;

export function getLogGroup(tags: TagId[]): LogGroup | undefined {
	return logGroups[tags.sort().join()];
}

let logGroupSubs: Set<() => void> = new Set();

function logGroupSubscribe(tags: TagId[]) {
	return (callback: () => void) => {
		logGroupSubs.add(callback);
		//console.log('setup group watcher for ' + tags.join());

		return () => {
			logGroupSubs.delete(callback);
			//console.log('cleanup group watcher for ' + tags.join());
		}
	}
}

const defaultLogGroup: LogGroup = { version: 0, id: '', tags: [], entries: [] };

function logGroupSnapshot(tags: TagId[]) {
	return () => getLogGroup(tags) ?? defaultLogGroup;
}

function logGroupServerSnapshot(tags: TagId[]) {
	return () => getLogGroup(tags) ?? defaultLogGroup;
}

export function useDatabaseLogGroup(tags: TagId[]) {
	const subscribe = useCallback(logGroupSubscribe(tags), [tags]);
	const snapshot = useCallback(logGroupSnapshot(tags), [tags]);
	const serverSnapshot = useCallback(logGroupServerSnapshot(tags), [tags]);
	return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function useDatabaseLogGroupMany(tags: TagId[][]) {
	throw new Error("Function not implemented.");
}

export function updateLogGroup(id: string, events: LogEntry[]) {
	const entry = Object.entries(logGroups).find(v => v[1].id == id);
	if(entry == undefined) return;
	const newEntry = JSON.parse(JSON.stringify(entry[1]));
	newEntry.events = events;
	logGroups[entry[0]] = newEntry;
	for(const callback of logGroupSubs) callback();
}

function workspaceSubscribe(callback: () => void) {
	//console.log('setup group watcher for ' + tags.join());

	return () => {
		//console.log('cleanup group watcher for ' + tags.join());
	}
}

function workspaceSnapshot() {
	return SampleWorkspace001;
}

function workspaceServerSnapshot() {
	return SampleWorkspace001;
}

export function useDatabaseWorkspace() {
	return useSyncExternalStore(workspaceSubscribe, workspaceSnapshot, workspaceServerSnapshot);
}