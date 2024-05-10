"use client";

import { useContext } from "react";
import { TimedUpdateContext, useFirstRenderFallback } from "~/components/TimedUpdateProvider";
import { updateLogGroup, useDatabaseLogGroup } from "~/utils/data";
import { PropertyId, TagId } from "~/utils/dataSchema";
import PlaySvg from "/public/Icon_Play.svg"
import PauseSvg from "/public/Icon_Pause.svg"
import { HorizontalTimeline } from "./HorizontalTimeline";
import { VerticalZigZagTimeline } from "./VerticalZigZagTimeline";

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

	const latestEvent = logGroup.entries[0];
	const hasFuture = latestEvent ? latestEvent[timePropName] > actualNow : false;

	const closestEventToNow = logGroup.entries.find(e => e[timePropName] <= actualNow);
	const isOnNow = closestEventToNow?.[boolPropName] ?? false;

	function addEvent() {
		let newEvents = logGroup.entries.slice();
		newEvents.unshift({
			version: 0,
			id: (Math.random() + 1).toString(36).substring(2),
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
	//className="my-1 justify-self-center md:justify-self-end self-center grid grid-cols-[1fr_auto] items-center gap-x-2 text-right max-w-full"

	return <div className={"grid md:grid-cols-[min(15%,_200px)_1fr] gap-x-2 md:pl-2"}>
		<div className="my-1 justify-self-center md:justify-self-end self-center grid grid-cols-[1fr_auto] items-center gap-x-2 text-right">
			<div className="font-bold overflow-hidden text-ellipsis">{props.view.name}</div>
			{!isOnNow && <button className="m-auto block rounded-full border-2 border-slate-950 enabled:hover:bg-slate-200 p-2 fill-slate-950 disabled:fill-slate-500 disabled:border-slate-500 disabled:border-dashed" onClick={addEvent} disabled={hasFuture}>
				<PlaySvg className="box-content" width="10" height="10" viewBox="0 0 16 16"/>
			</button>}
			{isOnNow && <button className="m-auto block rounded-full border-2 border-slate-950 enabled:hover:bg-slate-200 p-2 fill-slate-950 disabled:fill-slate-500 disabled:border-slate-500 disabled:border-dashed" onClick={addEvent} disabled={hasFuture}>
				<PauseSvg className="box-content" width="10" height="10" viewBox="0 0 16 16"/>
			</button>}
			{hasFuture && <div className="text-xs col-span-2 text-slate-500">(Has Future Events)</div>}
		</div>
		{props.view.type == View_PlayPause_Type.Horizontal && <HorizontalTimeline time={time.getTime()} length={24 * 60 * 60 * 1000} logGroup={logGroup} timePropName={timePropName} boolPropName={boolPropName} isOnNow={isOnNow} /> }
		{props.view.type == View_PlayPause_Type.VerticalZigZag && <VerticalZigZagTimeline time={nextMidnight.getTime()} nowTime={time.getTime()} timeLength={24 * 60 * 60 * 1000} segmentWidth={75} fallbackSegmentCount={20} logGroup={logGroup} timePropName={timePropName} boolPropName={boolPropName} isOnNow={isOnNow} hasFuture={hasFuture} suppressHydrationWarning />}
	</div>;
}