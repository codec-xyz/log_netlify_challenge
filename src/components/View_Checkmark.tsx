"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { TimedUpdateContext, useFirstRenderFallback } from "~/components/TimedUpdateProvider";
import { addToLog, useDatabaseLog as useDatabaseLog } from "~/utils/clientDBFunctions";
import { LogProperty_Time, PropertyId, TagId } from "~/utils/dataSchema";
import XSmallSvg from "/public/Icon_XSmall.svg"
import CheckmarkSvg from "/public/Icon_Checkmark.svg"
import CheckmarkEmptySvg from "/public/Icon_CheckmarkEmpty.svg"
import { HorizontalTimeline } from "./HorizontalTimeline";
import { VerticalZigZagTimeline } from "./VerticalZigZagTimeline";
import { CheckmarkTimeline } from "./CheckmarkTimeline";
import { timeAgoInfo } from "~/utils/timeline";
import { DotsTimeline } from "./DotsTimeline";
import { DBContext } from "./DBLoadServerRenderData";
import { nanoid } from "nanoid";

export enum View_Checkmark_Type {
	DotsTimeline,
	DailyCheckmark,
}

export type View_Checkmark = {
	name: string;
	tag: TagId;
	type: View_Checkmark_Type
}

export function View_Checkmark_Render(props: { view: View_Checkmark }) {
	const time = useContext(TimedUpdateContext);
	const db = useContext(DBContext);
	const log = { data: useDatabaseLog(db, props.view.tag, time.getTime() - (25 * 24 * 60 * 60 * 1000)) };

	const timePropName: PropertyId = LogProperty_Time;

	const actualNow = useFirstRenderFallback(() => new Date(), () => time).getTime();

	const latestEvent = log.data.entries[0];
	const hasFuture = latestEvent ? latestEvent[timePropName] > actualNow : false;
	
	const closestEventToNow = log.data.entries.find(e => e[timePropName] <= actualNow);
	const timeAgoLabel = closestEventToNow ? timeAgoInfo(actualNow - closestEventToNow[timePropName]) : '';

	function addEvent() {
		addToLog(db, props.view.tag, {
			version: 0,
			id: nanoid(),
			[timePropName]: new Date().getTime(),
		});
	}

	const nextMidnight = new Date(time);
	nextMidnight.setMilliseconds(0);
	nextMidnight.setSeconds(0);
	nextMidnight.setMinutes(0);
	nextMidnight.setHours(24);
	
	return <div className="grid md:grid-cols-[min(20%,_250px)_1fr] gap-x-2 md:pl-2">
		{props.view.type == View_Checkmark_Type.DotsTimeline && <>
			<div className="my-1 justify-self-center md:justify-self-end self-center grid grid-cols-[1fr_auto] items-center gap-x-2 text-right">
			<div className="font-bold">{props.view.name}</div>
			<button className="m-auto block rounded-full border-2 border-slate-950 enabled:hover:bg-slate-200 p-2 fill-slate-950 disabled:fill-slate-500 disabled:border-slate-500 disabled:border-dashed" onClick={addEvent}>
				<CheckmarkSvg className="box-content" width="10" height="10" viewBox="0 0 16 16"/>
			</button>
			<div className="text-xs col-span-2 text-slate-500">{timeAgoLabel}</div>
		</div>
			<DotsTimeline time={time.getTime()} length={24 * 60 * 60 * 1000 * 10} log={log.data} timePropName={timePropName} />
		</>}
		{props.view.type == View_Checkmark_Type.DailyCheckmark && <>
			<div className="my-1 justify-self-center md:justify-self-end self-center text-center md:text-right">
				<div className="font-bold">{props.view.name}</div>
				<div className="text-xs col-span-2 text-slate-500">{timeAgoLabel}</div>
			</div>
			<CheckmarkTimeline time={nextMidnight.getTime()} singleCheckmarkLength={24 * 60 * 60 * 1000} log={log.data} timePropName={timePropName} fallbackCount={30} />
		</>}
	</div>;
}