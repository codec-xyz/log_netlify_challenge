import { Workspace, ViewTypes, TagId, Tag, PropertyId, PropertyInfo, PropertyTypes, Log } from "./dataSchema";

export const SampleWorkspace001: Workspace = {
	version: 0,
	theme: 'system',
	viewPages: [{
		version: 0,
		id: 'id_of_myHomeView',
		name: 'MyHome',
		views: [
			{
				version: 0,
				id: 'id11',
				type: ViewTypes.PlayPause,
				info: {
					name: 'Sleep',
					tag: 'id_of_tag_sleeping',
					type: 1
				},
			},
			{
				version: 0,
				id: 'id1',
				type: ViewTypes.PlayPause,
				info: {
					name: 'Watching Youtube/Movies/Shows',
					tag: 'id_of_tag_watch',
					type: 0
				},
			},
			{
				version: 0,
				id: 'id14',
				type: ViewTypes.PlayPause,
				info: {
					name: 'Programming',
					tag: 'id_of_tag_programming',
					type: 0
				},
			},
			{
				version: 0,
				id: 'id15',
				type: ViewTypes.PlayPause,
				info: {
					name: 'College Work',
					tag: 'id_of_tag_college',
					type: 0
				},
			},
			{
				version: 0,
				id: 'id3',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Running',
					tag: 'id_of_tag_running',
					type: 1,
				},
			},
			{
				version: 0,
				id: 'id4',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Exercising',
					tag: 'id_of_tag_exercising',
					type: 1,
				},
			},
			{
				version: 0,
				id: 'id0',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Walk The Dog',
					tag: 'id_of_tag_walkTheDog',
					type: 0,
				},
			},
			// {
			//	version: 0,
			// 	id: 'id2',
			// 	type: ViewTypes.Enum,
			// 	info: {
			// 		name: 'Mood',
			// 		tag: 'id_of_tag_mood',
			// 	},
			// },
		],
	}],
};

export const SampleTags001_Queryable: {
	[key: TagId]: Tag;
} = {
	'id_of_tag_sleeping': {
		version: 0,
		id: 'id_of_tag_sleeping',
		name: 'Sleeping (Tag)',
		tags: [],
		properties: ['id_of_SysTimeProp', 'id_of_SysOnOffBoolProp'],
		c_allProperties: ['id_of_SysTimeProp', 'id_of_SysOnOffBoolProp'],
		c_logNonEmpty: true,
		viewers: [],
		logEditors: [],
	},
};

export const SampleProperties001: {
	[key: PropertyId]: PropertyInfo;
} = {
	'id_of_SysTimeProp': {
		version: 0,
		id: 'id_of_SysTimeProp',
		name: 'Event Time',
		type: PropertyTypes.Timepoint,
	},
	'id_of_SysOnOffBoolProp': {
		version: 0,
		id: 'id_of_SysOnOffBoolProp',
		name: 'On/Off',
		type: PropertyTypes.Boolean,
	},
};

export const SampleLogGroups001_Queryable: {
	[key: TagId]: Log;
} = {
	'id_of_tag_sleeping': {
		version: 0,
		id: 'id_of_tag_sleeping',
		entries: [
			// {
			// 	version: 0,
			// 	id: 'id_of_tag_sleeping_0',
			// 	'id_of_SysTimeProp': 1715212785362 + 120000 * 1000,
			// 	'id_of_SysOnOffBoolProp': false,
			// },
			{
				version: 0,
				id: 'id_of_tag_sleeping_1',
				'id_of_SysTimeProp': 1715207627551 - 0,
				'id_of_SysOnOffBoolProp': true,
			},
			{
				version: 0,
				id: 'id_of_tag_sleeping_2',
				'id_of_SysTimeProp': 1715207627551 - 4400 * 1000,
				'id_of_SysOnOffBoolProp': false,
			},
			{
				version: 0,
				id: 'id_of_tag_sleeping_3',
				'id_of_SysTimeProp': 1715207627551 - 15400 * 1000,
				'id_of_SysOnOffBoolProp': true,
			},
			{
				version: 0,
				id: 'id_of_tag_sleeping_4',
				'id_of_SysTimeProp': 1715207627551 - 21150 * 1000,
				'id_of_SysOnOffBoolProp': false,
			},
			{
				version: 0,
				id: 'id_of_tag_sleeping_5',
				'id_of_SysTimeProp': 1715207627551 - 41150 * 1000,
				'id_of_SysOnOffBoolProp': true,
			},
		],
	},
	'id_of_tag_walkTheDog': {
		version: 0,
		id: 'id_of_tag_walkTheDog',
		entries: [
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_0',
				'id_of_SysTimeProp': 1715212785362 + 120000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_1',
				'id_of_SysTimeProp': 1715207627551 - 0,
			},
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_2',
				'id_of_SysTimeProp': 1715207627551 - 44000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_3',
				'id_of_SysTimeProp': 1715207627551 - 44000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_4',
				'id_of_SysTimeProp': 1715207627551 - 44003 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_5',
				'id_of_SysTimeProp': 1715207627551 - 154000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_6',
				'id_of_SysTimeProp': 1715207627551 - 211500 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_walkTheDog_7',
				'id_of_SysTimeProp': 1715207627551 - 411500 * 1000,
			},
		],
	},
	'id_of_tag_running': {
		version: 0,
		id: 'id_of_tag_running',
		entries: [
			{
				version: 0,
				id: 'id_of_tag_running_0',
				'id_of_SysTimeProp': 1715323140718 + 120000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_running_1',
				'id_of_SysTimeProp': 1715323140718 - 0,
			},
			{
				version: 0,
				id: 'id_of_tag_running_2',
				'id_of_SysTimeProp': 1715323140718 - 44000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_running_3',
				'id_of_SysTimeProp': 1715207627551 - 44000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_running_4',
				'id_of_SysTimeProp': 1715323140718 - 44003 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_running_5',
				'id_of_SysTimeProp': 1715323140718 - 154000 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_running_6',
				'id_of_SysTimeProp': 1715323140718 - 211500 * 1000,
			},
			{
				version: 0,
				id: 'id_of_tag_running_7',
				'id_of_SysTimeProp': 1715323140718 - 411500 * 1000,
			},
		],
	},
	'id_of_tag_watch': {
		version: 0,
		id: 'id_of_tag_watch',
		entries: []
	},
	'id_of_tag_programming': {
		version: 0,
		id: 'id_of_tag_programming',
		entries: []
	},
	'id_of_tag_college': {
		version: 0,
		id: 'id_of_tag_college',
		entries: []
	},
	'id_of_tag_exercising': {
		version: 0,
		id: 'id_of_tag_exercising',
		entries: []
	},
};