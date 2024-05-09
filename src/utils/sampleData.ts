import { Workspace, ViewTypes, TagId, Tag, PropertyId, PropertyInfo, PropertyTypes, LogGroup } from "./viewData";

export const SampleWorkspace001: Workspace = {
	theme: 'system',
	viewPages: [{
		name: 'MyHome',
		views: [
			{
				v_id: 'id0',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Working on this project',
					tags: ['id_of_tag_workingOnThisProject'],
				},
			},
			{
				v_id: 'id1',
				type: ViewTypes.Single_PlayPause,
				info: {
					name: 'Sleep',
					tags: ['id_of_tag_sleeping'],
					type: 0
				},
			},
			{
				v_id: 'id11',
				type: ViewTypes.Single_PlayPause,
				info: {
					name: 'Sleep',
					tags: ['id_of_tag_sleeping'],
					type: 1
				},
			},
			{
				v_id: 'id2',
				type: ViewTypes.Enum,
				info: {
					name: 'Mood',
					tags: ['id_of_tag_mood'],
				},
			},
			{
				v_id: 'id3',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Running',
					tags: ['id_of_tag_running'],
				},
			},
			{
				v_id: 'id4',
				type: ViewTypes.Checkmark,
				info: {
					name: 'Invincible',
					tags: ['id_of_tag_Invincible'],
				},
			},
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
		id: 'id_of_logGroup_001(sleeping)',
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
};