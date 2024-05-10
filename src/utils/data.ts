import { useCallback, useSyncExternalStore } from "react";
import { TagId, Log, LogEntry } from "./dataSchema";
import { SampleLogGroups001_Queryable, SampleWorkspace001 } from "./sampleData";

let logGroups = SampleLogGroups001_Queryable;

export function getLogGroup(tag: TagId): Log | undefined {
	return logGroups[tag];
}

let logGroupSubs: Set<() => void> = new Set();

function logGroupSubscribe(tag: TagId) {
	return (callback: () => void) => {
		logGroupSubs.add(callback);
		//console.log('setup group watcher for ' + tags.join());

		return () => {
			logGroupSubs.delete(callback);
			//console.log('cleanup group watcher for ' + tags.join());
		}
	}
}

const defaultLogGroup: Log = { version: 0, id: '', entries: [] };

function logGroupSnapshot(tag: TagId) {
	return () => getLogGroup(tag) ?? defaultLogGroup;
}

function logGroupServerSnapshot(tag: TagId) {
	return () => getLogGroup(tag) ?? defaultLogGroup;
}

export function useDatabaseLog(tag: TagId) {
	const subscribe = useCallback(logGroupSubscribe(tag), [tag]);
	const snapshot = useCallback(logGroupSnapshot(tag), [tag]);
	const serverSnapshot = useCallback(logGroupServerSnapshot(tag), [tag]);
	return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function useDatabaseLogMany(tags: TagId[][]) {
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