import { useEffect, useRef, useState } from "react";
import { ExArr, calcRenderSegments } from "~/utils/timeline";
import { LogEntry, LogGroup, PropertyId } from "~/utils/dataSchema";
import XSmallSvg from "/public/Icon_XSmall.svg"
import CheckmarkSvg from "/public/Icon_Checkmark.svg"
import CheckmarkEmptySvg from "/public/Icon_CheckmarkEmpty.svg"

export function CheckmarkTimeline(props: { time: number, singleCheckmarkLength: number, logGroup: LogGroup, timePropName: PropertyId, fallbackCount: number }) {
	const [checkmarkCount, setCheckmarkCount] = useState(props.fallbackCount);
	const startTime = props.time - props.singleCheckmarkLength * checkmarkCount;


	const groupedEntriesObj = new ExArr(...props.logGroup.entries).group(entry => {
		const entryTime = entry[props.timePropName];
		let checkMarkIndex = (entryTime - startTime) / props.singleCheckmarkLength;
		if(checkMarkIndex < 0 || checkMarkIndex >= checkmarkCount) return;
		return startTime + Math.floor(checkMarkIndex) * props.singleCheckmarkLength;
	});

	const groupedEntries = ExArr.createMap(checkmarkCount, i => {
		const key = startTime + i * props.singleCheckmarkLength;
		return { key, values: groupedEntriesObj[key] ?? [] };
	}).reverse();

	const elementRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!elementRef.current) return;
		const resizeObserver = new ResizeObserver(() => {
			const element = elementRef.current as HTMLDivElement;
			//Warning: careful not to cause a loop
			setCheckmarkCount(Math.max(1, Math.floor(element.offsetWidth / 40)));
		});
		resizeObserver.observe(elementRef.current);
		return () => resizeObserver.disconnect();
	  }, []);

	return <div className="grid grid-rows-[1fr_repeat(32,0)] gap-x-2 mx-2 md:ml-0 overflow-hidden h-[40px]" ref={elementRef} style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${40}px), 1fr))` }}>
		{groupedEntries.map(entry => entry.values.length == 0 ?
			<XSmallSvg key={entry.key} className="fill-slate-200 m-auto" width="16" height="16" viewBox="0 0 16 16"/>
			: <div key={entry.key} className="grid">
				<CheckmarkSvg className="fill-slate-400 m-auto row-[1] col-[1]" width="20" height="20" viewBox="0 0 16 16"/>
				{entry.values.length > 1 && <div className="size-fit text-xs col-span-2 text-slate-500 row-[1] col-[1] place-self-end">{entry.values.length}</div>}
			</div>
		)}
	</div>;
}