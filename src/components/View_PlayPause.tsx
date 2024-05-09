"use client";

import { useContext } from "react";
import { TimedUpdateContext, useFirstRenderFallback } from "~/components/TimedUpdateProvider";
import { updateLogGroup, useDatabaseLogGroup } from "~/utils/data";
import { PropertyId, TagId } from "~/utils/viewData";
import PlaySvg from "/public/play_black_24dp.svg"
import PauseSvg from "/public/pause_black_24dp.svg"
import { SingleHorizontalTimeline } from "./SingleHorizontalTimeline";
import { SingleVerticalZigZagTimeline } from "./SingleVerticalZigZagTimeline";

export enum View_PlayPause_Type {
	Horizontal,
	VerticalZigZag,
}

export type View_PlayPause = {
	name: string;
	tags: TagId[];
	type: View_PlayPause_Type,
}

export function View_PlayPause_Render(props: { view: View_PlayPause }) {
	const time = useContext(TimedUpdateContext);
	const logGroup = useDatabaseLogGroup(props.view.tags);

	const timePropName: PropertyId = 'id_of_SysTimeProp';
	const boolPropName: PropertyId = 'id_of_SysOnOffBoolProp';

	const actualNow = useFirstRenderFallback(() => new Date(), () => time).getTime();

	const latestEvent = logGroup.events[0];
	const hasFuture = latestEvent ? latestEvent[timePropName] > actualNow : false;

	const closestEventToNow = logGroup.events.find(e => e[timePropName] <= actualNow);
	const isOnNow = closestEventToNow?.[boolPropName] ?? false;

	function addEvent() {
		let newEvents = logGroup.events.slice();
		newEvents.unshift({
			[timePropName]: new Date().getTime(),
			[boolPropName]: !isOnNow,
		});
		updateLogGroup(logGroup.id, newEvents);
	}

	const nextMidnight = new Date(time);
	nextMidnight.setMilliseconds(0);
	nextMidnight.setSeconds(0);
	nextMidnight.setMinutes(0);
	nextMidnight.setHours(24);

	return <div className={"grid grid-cols-[min(15%,_200px)_1fr] gap-2 pl-4 " + (props.view.type == View_PlayPause_Type.VerticalZigZag ? "h-32" : "h-16")}>
		<div className="my-1 justify-self-end self-center grid grid-cols-[1fr_auto] items-center gap-x-2 text-right">
			<div className="font-bold">{props.view.name}</div>
			{!isOnNow && <button className="m-auto block rounded-full border border-slate-950 enabled:hover:bg-slate-200 p-1 fill-slate-950 disabled:fill-slate-500 disabled:border-slate-500 disabled:border-dashed" onClick={addEvent} disabled={hasFuture}>
				<PlaySvg className="box-content" width="16" height="16" viewBox="0 0 24 24" />
			</button>}
			{isOnNow && <button className="m-auto block rounded-full border border-slate-950 enabled:hover:bg-slate-200 p-1 fill-slate-950 disabled:fill-slate-500 disabled:border-slate-500 disabled:border-dashed" onClick={addEvent} disabled={hasFuture}>
				<PauseSvg className="box-content" width="16" height="16" viewBox="0 0 24 24" />
			</button>}
			{hasFuture && <div className="text-xs col-span-2 text-slate-500 ">(Has Future Events)</div>}
		</div>
		{props.view.type == View_PlayPause_Type.Horizontal && <SingleHorizontalTimeline time={time.getTime()} length={24 * 60 * 60 * 1000} logGroup={logGroup} timePropName={timePropName} boolPropName={boolPropName} isOnNow={isOnNow} /> }
		{props.view.type == View_PlayPause_Type.VerticalZigZag && <SingleVerticalZigZagTimeline time={nextMidnight.getTime()} nowTime={time.getTime()} timeLength={24 * 60 * 60 * 1000} segmentWidth={75} fallbackSegmentCount={10} logGroup={logGroup} timePropName={timePropName} boolPropName={boolPropName} isOnNow={isOnNow} hasFuture={hasFuture} suppressHydrationWarning />}
	</div>;
}