export enum ViewTypes {
	PlayPause,
	MultiPlayPause,
	Enum,
	Checkmark,
	Number,
	AddEvent,
	FullPageCalender
}

export enum PropertyTypes {
	Timepoint,
	Boolean,
	Enum,
	Number,
	String,
	Markdown,
	Image,
}

export type ViewPageId = string;
export type ViewId = string;
export type PropertyId = string;
export type TagId = string;
export type LogGroupId = string;
export type LogEntryId = string;

export type Workspace = {
	version: number;
	theme: string;
	viewPages: ViewPage[];
}

export type ViewPage = {
	version: number;
	id: ViewPageId;
	name: string;
	views: View[];
}

export type View = {
	version: number;
	id: ViewId;
	type: ViewTypes
	info: any
}

export type PropertyInfo = {
	version: number;
	id: PropertyId;
	name: string;
	type: PropertyTypes;
} & ({} | {
	type: PropertyTypes.Enum;
	enumOptions: string[] 
});

export type Tag = {
	version: number;
	id: TagId;
	name: string;
	tags: TagId[];
	c_subTags: TagId[];
	c_logGroups: LogGroupId[];

	properties: PropertyId[];
}

export type LogGroup = {
	version: number;
	id: LogGroupId;
	tags: TagId[];
	entries: LogEntry[];
}

export type LogEntry = {
	version: number;
	id: LogEntryId;
	[key: PropertyId]: any;
};