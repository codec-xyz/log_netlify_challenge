import { ExArr } from "./ExArr";
import { LogEntry, PropertyId } from "./dataSchema";

export function timeAgoInfo(time: number) {
	if(time < 0) return '';
	if(time < 1000) return 'now';
	if(time < 60 * 1000) {
		const val = Math.floor(time / 1000);
		return val == 1 ? `${val} second ago` : `${val} seconds ago`;
	}
	if(time < 60 * 60 * 1000) {
		const val = Math.floor(time / (60 * 1000));
		return val == 1 ? `${val} minute ago` : `${val} minutes ago`;
	}
	if(time < 24 * 60 * 60 * 1000) {
		const val = Math.floor(time / (60 * 60 * 1000));
		return val == 1 ? `${val} hour ago` : `${val} hours ago`;
	}
	if(time < 365.4 * 24 * 60 * 60 * 1000) {
		const val = Math.floor(time / (24 * 60 * 60 * 1000));
		return val == 1 ? `${val} day ago` : `${val} days ago`;
	}
	const val = Math.floor(time / (365.4 * 24 * 60 * 60 * 1000));
	return val == 1 ? `${val} year ago` : `${val} years ago`;
	
}

export type Segment<T> = {
	key: string,
	percent: number,
	state: T,
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
};

export function calcRenderSegments<T>(startTime: number, endTime: number, logEntries: LogEntry[], timeProp: PropertyId, stateProp: PropertyId, defaultState: T): Segment<T>[] {
	const lengthTime = endTime - startTime;

	return new ExArr(
		{ key: 'EndKey', time: 1, state: defaultState },
		...logEntries.map(e => ({
			key: e.id,
			time: clamp((e[timeProp] - startTime) / lengthTime, 0, 1),
			state: e[stateProp],
		})),
		{ key: 'StartKey', time: 0, state: defaultState },
	)
	.mapInBetween((a, b) => ({
		key: b.key,
		percent: a.time - b.time,
		state: b.state,
	}))
	.filter(s => s.percent > 0.00001);
}