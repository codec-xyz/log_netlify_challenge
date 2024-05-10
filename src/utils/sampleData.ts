import { Workspace, ViewTypes, TagId, Tag, PropertyId, PropertyInfo, PropertyTypes, LogGroup } from "./viewData";

export const SampleWorkspace001: Workspace = {
	theme: 'system',
	viewPages: [{
		name: 'MyHome',
		views: [
			{
				v_id: 'id11',
				type: ViewTypes.PlayPause,
				info: {
					name: 'Sleep',
					tags: ['id_of_tag_sleeping'],
					type: 1
				},
			},
			{
				v_id: 'id1',
				type: ViewTypes.PlayPause,
				info: {
					name: 'Watching Youtube/Movies/Shows',
					tags: ['id_of_tag_watch'],
					type: 0
				},
			},
			{
				v_id: 'id14',
				type: ViewTypes.PlayPause,
				info: {
					name: 'Programming',
					tags: ['id_of_tag_programming'],
					type: 0
				},
			},
			{
				v_id: 'id15',
				type: ViewTypes.PlayPause,
				info: {
					name: 'College Work',
					tags: ['id_of_tag_college'],
					type: 0
				},
			},
			{
				v_id: 'id3',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Running',
					tags: ['id_of_tag_running'],
					type: 1,
				},
			},
			{
				v_id: 'id4',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Exercising',
					tags: ['id_of_tag_exercising'],
					type: 1,
				},
			},
			{
				v_id: 'id0',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Walk The Dog',
					tags: ['id_of_tag_walkTheDog'],
					type: 0,
				},
			},
			// {
			// 	v_id: 'id2',
			// 	type: ViewTypes.Enum,
			// 	info: {
			// 		name: 'Mood',
			// 		tags: ['id_of_tag_mood'],
			// 	},
			// },
		],
	}],
};

export const SampleTags001_Queryable: {
	[key: TagId]: Tag;
} = {
	'id_of_tag_sleeping': {
		id: 'id_of_tag_sleeping',
		name: 'Sleeping (Tag)',
		tags: [],
		c_subTags: [],
		c_logGroups: ['id_of_logGroup_001(sleeping)'],
		properties: ['id_of_SysTimeProp', 'id_of_SysOnOffBoolProp']
	},
};

export const SampleProperties001: {
	[key: PropertyId]: PropertyInfo;
} = {
	'id_of_SysTimeProp': {
		id: 'id_of_SysTimeProp',
		name: 'Event Time',
		type: PropertyTypes.Timepoint,
	},
	'id_of_SysOnOffBoolProp': {
		id: 'id_of_SysOnOffBoolProp',
		name: 'On/Off',
		type: PropertyTypes.Boolean,
	},
};

export const SampleLogGroups001_Queryable: {
	[key: string]: LogGroup; //key concat of all tag ids sorted
} = {
	'id_of_tag_sleeping': {
		id: 'id_of_logGroup(id_of_tag_sleeping)',
		tags: ['id_of_tag_sleeping'],
		events: [
			// {
			// 	'id_of_SysTimeProp': 1715212785362 + 120000 * 1000,
			// 	'id_of_SysOnOffBoolProp': false,
			// },
			{
				'id_of_SysTimeProp': 1715207627551 - 0,
				'id_of_SysOnOffBoolProp': true,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 4400 * 1000,
				'id_of_SysOnOffBoolProp': false,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 15400 * 1000,
				'id_of_SysOnOffBoolProp': true,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 21150 * 1000,
				'id_of_SysOnOffBoolProp': false,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 41150 * 1000,
				'id_of_SysOnOffBoolProp': true,
			},
		],
	},
	'id_of_tag_walkTheDog': {
		id: 'id_of_logGroup(id_of_tag_walkTheDog)',
		tags: ['id_of_tag_walkTheDog'],
		events: [
			{
				'id_of_SysTimeProp': 1715212785362 + 120000 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 0,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 44000 * 1000,
			},
			// {
			// 	'id_of_SysTimeProp': 1715207627551 - 44000 * 1000,
			// },
			{
				'id_of_SysTimeProp': 1715207627551 - 44003 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 154000 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 211500 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715207627551 - 411500 * 1000,
			},
		],
	},
	'id_of_tag_running': {
		id: 'id_of_logGroup(running)',
		tags: ['id_of_tag_running'],
		events: [
			{
				'id_of_SysTimeProp': 1715323140718 + 120000 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715323140718 - 0,
			},
			{
				'id_of_SysTimeProp': 1715323140718 - 44000 * 1000,
			},
			// {
			// 	'id_of_SysTimeProp': 1715207627551 - 44000 * 1000,
			// },
			{
				'id_of_SysTimeProp': 1715323140718 - 44003 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715323140718 - 154000 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715323140718 - 211500 * 1000,
			},
			{
				'id_of_SysTimeProp': 1715323140718 - 411500 * 1000,
			},
		],
	},
	'id_of_tag_watch': {
		id: 'id_of_logGroup(id_of_tag_watch)',
		tags: ['id_of_tag_watch'],
		events: []
	},
	'id_of_tag_programming': {
		id: 'id_of_logGroup(id_of_tag_programming)',
		tags: ['id_of_tag_programming'],
		events: []
	},
	'id_of_tag_college': {
		id: 'id_of_logGroup(id_of_tag_college)',
		tags: ['id_of_tag_college'],
		events: []
	},
	'id_of_tag_exercising': {
		id: 'id_of_logGroup(id_of_tag_exercising)',
		tags: ['id_of_tag_exercising'],
		events: []
	},
};