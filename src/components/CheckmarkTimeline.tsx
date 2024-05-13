import { useContext, useEffect, useRef, useState } from "react";
import { calcRenderSegments } from "~/utils/timeline";
import { LogEntry, Log, PropertyId } from "~/utils/dataSchema";
import XSmallSvg from "/public/Icon_XSmall.svg"
import CheckmarkSvg from "/public/Icon_Checkmark.svg"
import CheckmarkEmptySvg from "/public/Icon_CheckmarkEmpty.svg"
import { ExArr } from "~/utils/ExArr";
import { nanoid } from "nanoid";
import { addToLog, removeFromLog } from "~/utils/clientDBFunctions";
import { DBContext } from "./DBLoadServerRenderData";

export function CheckmarkTimeline(props: { time: number, singleCheckmarkLength: number, log: Log, timePropName: PropertyId, fallbackCount: number }) {
	const db = useContext(DBContext);
	const [checkmarkCount, setCheckmarkCount] = useState(props.fallbackCount);
	const startTime = props.time - props.singleCheckmarkLength * checkmarkCount;


	const groupedEntriesObj = new ExArr(...props.log.entries).group(entry => {
		const entryTime = entry[props.timePropName];
		let checkMarkIndex = (entryTime - startTime) / props.singleCheckmarkLength;
		if(checkMarkIndex < 0 || checkMarkIndex >= checkmarkCount) return;
		return startTime + Math.floor(checkMarkIndex) * props.singleCheckmarkLength;
	});

	const groupedEntries = ExArr.createMap(checkmarkCount, i => {
		const key = startTime + i * props.singleCheckmarkLength;
		return { key, values: groupedEntriesObj[key] ?? [] as LogEntry[] };
	}).reverse();

	const elementRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!elementRef.current) return;
		const resizeObserver = new ResizeObserver(() => {
			const element = elementRef.current as HTMLDivElement;
			if(element == null) return;
			//Warning: careful not to cause a loop
			setCheckmarkCount(Math.max(1, Math.floor(element.offsetWidth / 40)));
		});
		resizeObserver.observe(elementRef.current);
		return () => resizeObserver.disconnect();
	  }, []);

	function addEvent(time: number) {
		addToLog(db, props.log.id, {
			version: 0,
			id: nanoid(),
			[props.timePropName]: time,
		});
	}

	function removeEvents(ids: string[]) {
		ids.forEach(id => removeFromLog(db, props.log.id, id));
	}

	return <div className="grid grid-rows-[1fr_repeat(32,0)] gap-x-2 mx-2 md:ml-0 overflow-hidden h-[40px]" ref={elementRef} style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${40}px), 1fr))` }}>
		{groupedEntries.map(entry => <div className="size-full grid rounded-full transitions hover:bg-slate-100" onClick={() => {
			if(entry.values.length == 0) addEvent(entry.key + props.singleCheckmarkLength * 0.5);
			else removeEvents(entry.values.map(e => e.id));
		}}>
			{entry.values.length == 0 ?
			<XSmallSvg key={entry.key} className="fill-slate-200 m-auto" width="16" height="16" viewBox="0 0 16 16"/>
			: <div key={entry.key} className="grid">
				<CheckmarkSvg className="fill-slate-400 m-auto row-[1] col-[1]" width="20" height="20" viewBox="0 0 16 16"/>
				{entry.values.length > 1 && <div className="size-fit text-xs text-slate-500 row-[1] col-[1] place-self-end">{entry.values.length}</div>}
			</div>}
		</div>)}
	</div>;
}