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
export type LogEntryId = string;
export type UserId = string;

export type UserData = {
	version: number;
	workspace: Workspace;
	tags: Tag[];
	properties: PropertyInfo[];

	sharedTags: {
		user: UserId,
		tags: TagId[],
	}[];
}

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
	type: ViewTypes;
	info: any;
}

export const LogProperty_Time = 'LogTimeProperty';

export type PropertyInfo = {
	version: number;
	id: PropertyId;
	name: string;
	type: PropertyTypes;
	typeSettings?: any;
};

export type Tag = {
	version: number;
	id: TagId;
	name: string;
	tags: TagId[];

	properties: PropertyId[];

	viewers: UserId[];
	logEditors: UserId[];
}

export type Log = {
	version: number;
	id: TagId;
	entries: LogEntry[];
}

export type LogEntry = {
	version: number;
	id: LogEntryId;
	[key: PropertyId]: any;
};

export type TagGraph = Map<TagId, {
	parentTags: Set<TagId>, //tag
	childrenTags: Set<TagId>, //reverse of tag
	tag: Tag,
}>;

export function removeLogEntry(entries: LogEntry[], removeEntryId: LogEntryId) {
	const removeIndex = entries.findIndex(e => e.id == removeEntryId);
	if(removeIndex != -1) entries.splice(removeIndex, 1);
}

export function addLogEntry(entries: LogEntry[], addEntry: LogEntry) {
	const removeIndex = entries.findIndex(e => e.id == addEntry.id);
	if(removeIndex != -1 && addEntry.version < entries[removeIndex]!.version) return;
	if(removeIndex != -1) entries.splice(removeIndex, 1);

	const insertIndex = entries.findIndex(e => e[LogProperty_Time] < addEntry[LogProperty_Time]);
	entries.splice(insertIndex, 0, addEntry);
}

export function makeTagGraph(tags: Tag[]): TagGraph {
	const graph: TagGraph = new Map(tags.map(tag =>
		[tag.id, {
			parentTags: new Set(tag.tags),
			childrenTags: new Set(),
			tag: tag,
		}
	]));

	graph.forEach((tag, id) => {
		tag.parentTags.forEach(parentId => {
			const parent = graph.get(parentId);
			if(parent == undefined) {
				tag.parentTags.delete(parentId);
				return;
			}

			parent.childrenTags.add(id);
		});
	});

	return graph;
}

export function calcThisAndAllParentTagIds(graph: TagGraph, tagId: TagId) {
	const visited: Set<TagId> = new Set();
	const todo: Set<TagId> = new Set([tagId]);

	while(todo.size > 0) {
		todo.forEach(tagId => {
			visited.add(tagId);
			todo.delete(tagId);

			const tag = graph.get(tagId);
			if(tag == undefined) throw new Error(`Tag id: ${tagId} is not in graph`);

			tag.parentTags.forEach(parentId => {
				if(visited.has(parentId)) return;
				todo.add(parentId);
			});
		});
	}

	return visited;
}