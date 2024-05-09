import { Timepoint } from "./timepoint";

//v_ data generted for viewer. not sorted outside view
//c_ computed data. can be deleted

export enum ViewTypes {
	Single_PlayPause,
	Multi_PlayPause,
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

export type PropertyId = string;
export type TagId = string;
export type LogGroupId = string;

export type Workspace = {
	theme: string;
	viewPages: ViewPage[];
}

export type ViewPage = {
	name: string;
	views: View[];
}

export type View = {
	v_id: string;
	type: ViewTypes
	info: any
}

export type PropertyInfo = {
	id: PropertyId;
	name: string;
	type: PropertyTypes;
} & ({} | {
	type: PropertyTypes.Enum;
	enumOptions: string[] 
});

export type Tag = {
	id: TagId;
	name: string;
	tags: TagId[];
	c_subTags: TagId[];
	c_logGroups: LogGroupId[];

	properties: PropertyId[];
}

export type LogGroup = {
	id: LogGroupId;
	tags: TagId[];
	events: LogEntry[];
}

export type LogEntry = {
	[key: PropertyId]: any;
};