import { LogEntry, PropertyId } from "./viewData";

export type Segment<T> = {
	key: number,
	percent: number,
	state: T,
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
};

class ExArr<T> extends Array<T> {
	mapInBetween<U>(fn: (a: T, b: T) => U): ExArr<U> {
		return (new ExArr(this.length - 1)).fill(undefined).map((_, i) => fn(this[i] as T, this[i + 1] as T)) as ExArr<U>;
	}
}

export function calcRenderSegments<T>(startTime: number, endTime: number, logEntries: LogEntry[], timeProp: PropertyId, stateProp: PropertyId, defaultState: T): Segment<T>[] {
	const lengthTime = endTime - startTime;

	return new ExArr(
		{ key: 2, time: 1, state: defaultState },
		...logEntries.map(e => ({
			key: e[timeProp],
			time: clamp((e[timeProp] - startTime) / lengthTime, 0, 1),
			state: e[stateProp],
		})),
		{ key: 1, time: 0, state: defaultState },
	)
	.mapInBetween((a, b) => ({
		key: b.key,
		percent: a.time - b.time,
		state: b.state,
	}))
	.filter(s => s.percent > 0.00001);
}