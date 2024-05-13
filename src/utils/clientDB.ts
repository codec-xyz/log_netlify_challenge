import { cache } from "react";
import { Log, LogEntry, LogEntryId, LogProperty_Time, PropertyId, PropertyInfo, Tag, TagGraph, TagId, UserData, ViewTypes, Workspace, addLogEntry, calcThisAndAllParentTagIds, makeTagGraph } from "./dataSchema";
import { ExArr, mapMap } from "./ExArr";
import { getAllEssentials_returnType } from "~/server/api/routers/db";
import _ from "lodash";

export type LogQuerier = {
	logAge: number,
	lastUpdateVersion: number,
	startTime: number,
	endTime: number,
	log: Log,

	needsUpdate: boolean,
	deleteAllEntries: number,
	setEntries: Map<LogEntryId, LogEntry>,
	deleteEntries: Map<LogEntryId, number>,
	watchers: Map<() => void, {
		startTime?: number,
		endTime?: number,
	}>,
};

export function makeDefaultLogQuerier(tagId: TagId): LogQuerier {
	return {
		logAge: 0,
		lastUpdateVersion: 0,
		startTime: 0,
		endTime: 0,
		log: { id: tagId, version: 0, entries: [] },
		needsUpdate: false,
		deleteAllEntries: 0,
		setEntries: new Map(),
		deleteEntries: new Map(),
		watchers: new Map(),
	};
}

export function addLogToLog(log: Log, addLog: Log) {
	log.version = Math.max(log.version, addLog.version);
	addLog.entries.forEach(e => addLogEntry(log.entries, e));
}

export type Log_RequestPending = {

};

export type Log_RequestError = {
	message: string,
};

export type ClientDB = {
	userEssentialsAge: number;
	userDataLastUpdateVersion: number,
	userWorkspaceLastUpdateVersion: number,
	userData: UserData;
	workspaceHasUpdate: boolean;
	updatedProperties: Set<PropertyId>;
	updatedTags: Set<TagId>;
	deletedProperties: Set<PropertyId>;
	deletedTags: Set<TagId>;
	sharedWithMePropertyInfos: Map<PropertyId, PropertyInfo>;
	sharedWithMeTags: Map<TagId, Tag>;
	tagGraph: TagGraph,
	logs: Map<TagId, LogQuerier>;
	workspaceWatchers: Set<() => void>;
	propsAndTagsWatchers: Set<() => void>;
	log_RequestPendings: Map<TagId, Log_RequestPending>,
	log_RequestErrors: Map<TagId, Log_RequestError>,
	workspaceSetPending: boolean,
	workspaceSetError: boolean,
	tagsAndPropertiesSetPending: boolean,
	tagsAndPropertiesSetError: boolean,
};

export function assureLogQuerier(db: ClientDB, tagId: TagId): LogQuerier {
	let logData = db.logs.get(tagId);
	if (!logData) db.logs.set(tagId, logData = makeDefaultLogQuerier(tagId));
	return logData;
}

export const getDB = cache(() => {
	// return {
	// 	userEssentialsAge: 0,
	// 	userDataLastUpdateVersion: 0,
	// 	userWorkspaceLastUpdateVersion: 0,
	// 	userData: {
	// 		version: 0,
	// 		workspace: {
	// 			version: 0,
	// 			theme: 'system',
	// 			viewPages: [{
	// 				id: 'WnQ46LD5Hm6D5288LJoOY',
	// 				version: 1,
	// 				name: 'Home Page',
	// 				views: [{
	// 					version: 1,
	// 					id: '5656456456',
	// 					type: ViewTypes.PlayPause,
	// 					info: { tag: 'Sleeping', name: 'Sleeping', type: 1 },
	// 				}, {
	// 					"version": 1715563307507,
	// 					"id": "PqDjwqU80hpcizKpmVQgL",
	// 					"type": 0,
	// 					"info": {
	// 						"name": "Watching",
	// 						"tag": "Watching",
	// 						"type": 0
	// 					}
	// 				},
	// 				{
	// 					"version": 1715562316190,
	// 					"id": "Ha51B4YSJEpZ7zKZlp71i",
	// 					"type": 0,
	// 					"info": {
	// 						"name": "Programming",
	// 						"tag": "Programming",
	// 						"type": 0
	// 					}
	// 				},
	// 				{
	// 					"version": 1715563287086,
	// 					"id": "iLx5VZ4DFDUkgCZLOXaVs",
	// 					"type": 0,
	// 					"info": {
	// 						"name": "College",
	// 						"tag": "College",
	// 						"type": 0
	// 					}
	// 				},
	// 				{
	// 					"version": 1715563267689,
	// 					"id": "VB-_1bbQLVrGITawgmalp",
	// 					"type": 3,
	// 					"info": {
	// 						"name": "Stretch",
	// 						"tag": "Stretch",
	// 						"type": 1
	// 					}
	// 				},
	// 				{
	// 					"version": 1715563267689,
	// 					"id": "ILIiZkUoOuPEoK0ql0RFb",
	// 					"type": 3,
	// 					"info": {
	// 						"name": "Exercise",
	// 						"tag": "Exercise",
	// 						"type": 1
	// 					}
	// 				},
	// 				{
	// 					"version": 1715562557245,
	// 					"id": "gxnrueWGrrDYI0TeI94iX",
	// 					"type": 3,
	// 					"info": {
	// 						"name": "Run",
	// 						"tag": "Run",
	// 						"type": 1
	// 					}
	// 				},
	// 				{
	// 					"version": 1715563213437,
	// 					"id": "9GethCL6LvemhUyrWeFd3",
	// 					"type": 3,
	// 					"info": {
	// 						"name": "Walk the dog",
	// 						"tag": "Walk the dog",
	// 						"type": 0
	// 					}
	// 				}],
	// 			}],
	// 		},
	// 		tags: [],
	// 		properties: [],
	// 		sharedTags: [],
	// 	},
	// 	workspaceHasUpdate: false,
	// 	updatedProperties: new Set(),
	// 	updatedTags: new Set(),
	// 	deletedProperties: new Set(),
	// 	deletedTags: new Set(),
	// 	sharedWithMePropertyInfos: new Map(),
	// 	sharedWithMeTags: new Map(),
	// 	tagGraph: new Map(),
	// 	logs: new Map([
	// 		["Sleeping", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "Sleeping",
	// 				entries: [
	// 					{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.8 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 1.2 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '30', [LogProperty_Time]: 1715566379783 - 1.83 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '40', [LogProperty_Time]: 1715566379783 - 2.2 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '50', [LogProperty_Time]: 1715566379783 - 2.8 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '60', [LogProperty_Time]: 1715566379783 - 3.25 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '70', [LogProperty_Time]: 1715566379783 - 3.73 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '80', [LogProperty_Time]: 1715566379783 - 4.24 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '90', [LogProperty_Time]: 1715566379783 - 4.78 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '00', [LogProperty_Time]: 1715566379783 - 5.14 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
						
	// 					{ version: 0, id: '2130', [LogProperty_Time]: 1715566379783 - 5.75 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '120', [LogProperty_Time]: 1715566379783 - 6.14 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '130', [LogProperty_Time]: 1715566379783 - 6.73 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '140', [LogProperty_Time]: 1715566379783 - 7.15 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '150', [LogProperty_Time]: 1715566379783 - 7.69 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '01', [LogProperty_Time]: 1715566379783 - 8.11 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '06', [LogProperty_Time]: 1715566379783 - 8.69 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '07', [LogProperty_Time]: 1715566379783 - 9.12 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '08', [LogProperty_Time]: 1715566379783 - 9.76 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '09', [LogProperty_Time]: 1715566379783 - 10.1 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '00', [LogProperty_Time]: 1715566379783 - 10.6 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '0-', [LogProperty_Time]: 1715566379783 - 11.06 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '0=', [LogProperty_Time]: 1715566379783 - 11.5 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '98', [LogProperty_Time]: 1715566379783 - 12.01 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '07', [LogProperty_Time]: 1715566379783 - 12.69 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '04', [LogProperty_Time]: 1715566379783 - 13.14 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '130', [LogProperty_Time]: 1715566379783 - 13.7 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '140', [LogProperty_Time]: 1715566379783 - 14.14 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '150', [LogProperty_Time]: 1715566379783 - 14.63 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '01', [LogProperty_Time]: 1715566379783 - 15.22 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '06', [LogProperty_Time]: 1715566379783 - 15.7 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '07', [LogProperty_Time]: 1715566379783 - 16.0 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 				],
	// 			},

	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 		["Watching", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "Watching",
	// 				entries: [
	// 					{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.2 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 0.35 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '30', [LogProperty_Time]: 1715566379783 - 0.6 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '40', [LogProperty_Time]: 1715566379783 - 0.9 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 				],
	// 			},

	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 		["Programming", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "Programming",
	// 				entries: [
	// 					{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.2 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 					{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.367 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': false },
	// 					{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 0.6 * (24 * 60 * 60 * 1000), 'id_of_SysOnOffBoolProp': true },
	// 				],
	// 			},

	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 		["College", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "College",
	// 				entries: [
	// 				],
	// 			},

	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 		 ["Stretch", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "Programming",
	// 				entries: [
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 1.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 2.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 3.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 4.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 5.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 6.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 7.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 8.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 9.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 10.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 11.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 12.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 13.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 14.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 15.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 16.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 17.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 18.5 * (24 * 60 * 60 * 1000)},
	// 					 // { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 19.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 20.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 21.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 22.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 23.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 24.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 25.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 26.5 * (24 * 60 * 60 * 1000)},
	// 				],
	// 			},
		
	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 		 ["Exercise", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "Programming",
	// 				entries: [
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 1.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 2.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 3.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 4.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 5.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 5.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 6.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 7.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 8.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 9.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 10.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 11.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 12.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 13.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 13.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 14.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 15.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 16.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 17.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 18.5 * (24 * 60 * 60 * 1000)},
	// 					 // { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 19.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 20.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 20.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 21.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 22.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 23.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 24.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 24.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 25.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 26.5 * (24 * 60 * 60 * 1000)},
	// 				],
	// 			},
		
	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 		 ["Run", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "Programming",
	// 				entries: [
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 1.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 2.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 3.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 4.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 5.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 6.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 7.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 8.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 9.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 10.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 11.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 12.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 12.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 13.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 14.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 15.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 16.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 17.5 * (24 * 60 * 60 * 1000)},
	// 					//{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 18.5 * (24 * 60 * 60 * 1000)},
	// 					 // { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 19.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 20.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 21.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 22.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 22.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 23.5 * (24 * 60 * 60 * 1000)},
	// 					 { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 24.5 * (24 * 60 * 60 * 1000)},
	// 					// { version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 25.5 * (24 * 60 * 60 * 1000)},
	// 					 //{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 26.5 * (24 * 60 * 60 * 1000)},
	// 				],
	// 			},
		
	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 		 ["Walk the dog", {
	// 			logAge: 0,
	// 			lastUpdateVersion: 0,
	// 			startTime: 0,
	// 			endTime: 0,
	// 			log: {
	// 				version: 0,
	// 				id: "Programming",
	// 				entries: [
	// 					{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.2 * (24 * 60 * 60 * 1000)},
	// 					{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.42 * (24 * 60 * 60 * 1000)},
	// 					{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 0.57 * (24 * 60 * 60 * 1000)},
	// 					{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 0.7 * (24 * 60 * 60 * 1000)},
	// 					//{ version: 0, id: '10', [LogProperty_Time]: 1715566379783 - 4.5 * (24 * 60 * 60 * 1000)},
	// 					//{ version: 0, id: '20', [LogProperty_Time]: 1715566379783 - 5.5 * (24 * 60 * 60 * 1000)},
	// 				],
	// 			},
		
	// 			needsUpdate: false,
	// 			deleteAllEntries: 0,
	// 			setEntries: new Map(),
	// 			deleteEntries: new Map(),
	// 			watchers: new Map(),
	// 		} as LogQuerier],
	// 	]),
	// 	workspaceWatchers: new Set(),
	// 	propsAndTagsWatchers: new Set(),
	// 	log_RequestPendings: new Map(),
	// 	log_RequestErrors: new Map(),
	// 	workspaceSetPending: false,
	// 	workspaceSetError: false,
	// 	tagsAndPropertiesSetPending: false,
	// 	tagsAndPropertiesSetError: false,
	// } as ClientDB;

	return {
		userEssentialsAge: 0,
		userDataLastUpdateVersion: 0,
		userWorkspaceLastUpdateVersion: 0,
		userData: {
			version: 0,
			workspace: {
				version: 0,
				theme: 'system',
				viewPages: [{
					id: 'WnQ46LD5Hm6D5288LJoOY',
					version: 1,
					name: 'Home Page',
					views: [],
				}
				],
			},
			tags: [],
			properties: [],
			sharedTags: [],
		},
		workspaceHasUpdate: false,
		updatedProperties: new Set(),
		updatedTags: new Set(),
		deletedProperties: new Set(),
		deletedTags: new Set(),
		sharedWithMePropertyInfos: new Map(),
		sharedWithMeTags: new Map(),
		tagGraph: new Map(),
		logs: new Map(),
		workspaceWatchers: new Set(),
		propsAndTagsWatchers: new Set(),
		log_RequestPendings: new Map(),
		log_RequestErrors: new Map(),
		workspaceSetPending: false,
		workspaceSetError: false,
		tagsAndPropertiesSetPending: false,
		tagsAndPropertiesSetError: false,
	} as ClientDB;
});

export function getAllEssentials_makeRequestData(db: ClientDB) {
	return {
		userVersion: db.userDataLastUpdateVersion,
		sharedPropertyInfoVersions: mapMap(db.sharedWithMePropertyInfos, (key, val) => [key, val.version]),
		sharedTagVersions: mapMap(db.sharedWithMeTags, (key, val) => [key, val.version]),
	};
}

export function getAllEssentials_saveResponse(db: ClientDB, response: getAllEssentials_returnType) {
	if (response.userData !== undefined) db.userData = response.userData;
	response.propertyInfos.forEach(v => db.sharedWithMePropertyInfos.set(v.id, v));
	response.tags.forEach(v => db.sharedWithMeTags.set(v.id, v));

	db.tagGraph = makeTagGraph([...db.userData.tags, ...Array.from(db.sharedWithMeTags).map(a => a[1])]);
	const sharedWithMeTags = new Set(
		db.userData.sharedTags.flatMap(a => a.tags)
			.flatMap(tagId => Array.from(calcThisAndAllParentTagIds(db.tagGraph, tagId)))
	);

	const sharedPropertyInfoIds: Set<PropertyId> = new Set();
	db.sharedWithMeTags.forEach(tag => {
		if (!sharedWithMeTags.has(tag.id)) {
			db.sharedWithMeTags.delete(tag.id);
			return;
		}

		tag.properties.forEach(prop => sharedPropertyInfoIds.add(prop));
	});
	db.sharedWithMePropertyInfos.forEach(prop => {
		if (!sharedPropertyInfoIds.has(prop.id)) {
			db.sharedWithMePropertyInfos.delete(prop.id);
			return;
		}
	});

	db.tagGraph = makeTagGraph([...db.userData.tags, ...Array.from(db.sharedWithMeTags).map(a => a[1])]);

	db.userEssentialsAge = new Date().getTime();
	db.userDataLastUpdateVersion = db.userData.version;
	db.userWorkspaceLastUpdateVersion = db.userData.workspace.version;

	db.workspaceWatchers.forEach((_, fn) => fn());
	db.propsAndTagsWatchers.forEach((_, fn) => fn());
}

export function getLogs_makeRequestData(db: ClientDB, arr: { id: TagId, startTime?: number, endTime?: number }[]) {
	return {
		logs: arr.filter(a => a.id != undefined && a.id !== '').map(a => {
			const logQuerier = db.logs.get(a.id);
			return {
				id: a.id,
				startTime: a.startTime ?? Number.MIN_VALUE,
				endTime: a.endTime ?? Number.MAX_VALUE,
				version: logQuerier && logQuerier.startTime === a.startTime && logQuerier.endTime === a.endTime ? logQuerier.lastUpdateVersion : 0,
			};
		}),
	};
}

export function getLogs_saveResponse(db: ClientDB, response: { logs: Map<TagId, { startTime: number, endTime: number, log: Log }> }) {
	response.logs.forEach(log => {
		const logQuerier = assureLogQuerier(db, log.log.id);

		logQuerier.logAge = new Date().getTime();
		logQuerier.lastUpdateVersion = Math.max(logQuerier.lastUpdateVersion, log.log.version);
		logQuerier.startTime = log.startTime ?? Number.MIN_VALUE;
		logQuerier.endTime = log.endTime ?? Number.MAX_VALUE;

		addLogToLog(logQuerier.log, log.log);

		logQuerier.log = _.cloneDeep(logQuerier.log);
		logQuerier.watchers.forEach((_, fn) => fn());
	});
}

export function setMyWorkspace_makeRequestData(db: ClientDB) {
	return {
		lastUpdateVersion: db.userWorkspaceLastUpdateVersion,
		workspace: db.userData.workspace,
	}
}

export function setMyWorkspace_saveResponse(db: ClientDB, response: { workspace?: Workspace }) {
	if (!response.workspace) return;
	db.userData.workspace = response.workspace;
	db.userWorkspaceLastUpdateVersion = db.userData.workspace.version;
	db.userData.version = Math.max(db.userData.version, db.userData.workspace.version);
	db.workspaceWatchers.forEach((_, fn) => fn());
}

export function updateLogs_makeRequestData_clearChanges(db: ClientDB) {
	const needingUpdate = [...db.logs.values()].filter(log => {
		return !db.log_RequestPendings.has(log.log.id)
			&& !db.log_RequestErrors.has(log.log.id)
			&& (log.deleteAllEntries != 0
				|| log.deleteEntries.size != 0
				|| log.setEntries.size != 0)
	});

	const request = {
		setLogs: needingUpdate.map(log => {
			return {
				lastUpdateVersion: log.lastUpdateVersion,
				version: log.log.version,
				id: log.log.id,
				startTime: log.startTime,
				endTime: log.endTime,

				deleteAllEntries: log.deleteAllEntries,
				setEntries: new Map([...log.setEntries].map(log => [log[0], {
					version: log[1].version,
					id: log[1].id,
					data: log[1],
				}])),
				deleteEntries: log.deleteEntries,
			}
		}),
	};

	needingUpdate.forEach(log => {
		log.deleteAllEntries = 0;
		log.deleteEntries = new Map();
		log.setEntries = new Map();
		db.log_RequestPendings.set(log.log.id, {});
	});

	return request;
}

export function updateLogs_saveResponse(db: ClientDB, response: { logs: Map<TagId, Log> }) {
	response.logs.forEach(log => {
		const logQuerier = assureLogQuerier(db, log.id);

		logQuerier.logAge = new Date().getTime();
		logQuerier.lastUpdateVersion = Math.max(logQuerier.lastUpdateVersion, log.version);

		addLogToLog(logQuerier.log, log);

		logQuerier.watchers.forEach((_, fn) => fn());
	});
}

export function updateMyTagsAndProperties_makeRequestData_clearChanges(db: ClientDB) {
	const props = new Map(db.userData.properties.map(prop => [prop.id, prop]));
	const tags = new Map(db.userData.tags.map(tag => [tag.id, tag]));

	const request = {
		setPropertyInfos: [...db.updatedProperties].map(propId => props.get(propId)!),
		setTags: [...db.updatedTags].map(tagId => tags.get(tagId)!),
		deletePropertyInfos: db.deletedProperties,
		deleteTags: db.deletedTags,
	}

	db.updatedProperties = new Set();
	db.updatedTags = new Set();
	db.deletedProperties = new Set();
	db.deletedTags = new Set();

	return request;
}

export function updateMyTagsAndProperties_saveResponse(db: ClientDB, response: { propertyInfos: PropertyInfo[], tags: Tag[] }) {
	response.propertyInfos.forEach(prop => {
		let index = db.userData.properties.findIndex(p => p.id == prop.id);
		if (index == -1) db.userData.properties.push(prop);
		else db.userData.properties[index] = prop;
		db.userData.version = Math.max(db.userData.version, prop.version);
	});

	response.tags.forEach(tag => {
		let index = db.userData.tags.findIndex(p => p.id == tag.id);
		if (index == -1) db.userData.tags.push(tag);
		else db.userData.tags[index] = tag;
		db.userData.version = Math.max(db.userData.version, tag.version);
	});

	db.propsAndTagsWatchers.forEach((_, fn) => fn());
}