import { useRef, useEffect, useState, createElement } from "react";
import { Segment, calcRenderSegments } from "~/utils/timeline";
import { Log, PropertyId } from "~/utils/dataSchema";

export function VerticalZigZagTimeline(props: { time: number, nowTime: number, timeLength: number, segmentWidth: number, fallbackSegmentCount: number, log: Log, timePropName: PropertyId, boolPropName: PropertyId, isOnNow: boolean, hasFuture: boolean, suppressHydrationWarning: true }) {
	const [zigZagCount, setZigZagCount] = useState(props.fallbackSegmentCount);

	let events = props.log.entries;
	const behindNow = props.time != props.nowTime;
	if(!props.hasFuture && behindNow) {
		events = events.slice();
		events.unshift({ version: 0, id: 'EndKey', [props.timePropName]: props.nowTime, [props.boolPropName]: false });
	}
	
	const segments = Array(zigZagCount).fill(undefined).map((_, i) => {
		const startTime = props.time - props.timeLength * (i + 1);
		const endTime = props.time - props.timeLength * (i);
		return {
			key: startTime,
			segments: calcRenderSegments(startTime, endTime, events, props.timePropName, props.boolPropName, false),
		};
	});

	const firstSegmentArr = (segments[0] as {key: number, segments: Segment<boolean>[]}).segments;
	const firstSegment = (firstSegmentArr[0] as Segment<boolean>);
	const skipSegment = behindNow && !firstSegment.state && firstSegment.percent != 100;

	if(skipSegment) {
		(segments[0] as {key: number, segments: Segment<boolean>[]}).segments.shift();
		(segments[0] as {key: number, segments: Segment<boolean>[]}).segments = firstSegmentArr.map(s => ({
			key: s.key,
			percent: s.percent * 1 / (1 - firstSegment.percent),
			state: s.state,
		}));
	}

	const elementRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!elementRef.current) return;
		const resizeObserver = new ResizeObserver(() => {
			const element = elementRef.current as HTMLDivElement;
			//Warning: careful not to cause a loop
			setZigZagCount(Math.max(1, Math.floor(element.offsetWidth / props.segmentWidth)));
		});
		resizeObserver.observe(elementRef.current);
		return () => resizeObserver.disconnect();
	  }, []);

	return <div className="h-32 grid grid-rows-[1fr_repeat(32,0)] gap-x-2 mx-2 md:ml-0 overflow-hidden" ref={elementRef} style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${props.segmentWidth}px), 1fr))` }}>
		{segments.map((ss, ii) => <div className="flex flex-col items-start" key={ss.key}>
			{ii == 0 && skipSegment && <div className="w-full border-t-[4px] border-x-[4px] border-slate-200" style={{ height: (firstSegment.percent * 100) + "%", background: "repeating-linear-gradient(45deg, transparent, transparent 5.6568px, rgb(226 232 240) 5.6568px, rgb(226 232 240) 11.3137px)" }}></div>}
			<div className="w-full flex flex-col items-start bg-slate-200" style={{ height: (ii == 0 && skipSegment) ? (100 - firstSegment.percent * 100) + "%" : "100%" }}>
				{ss.segments.map((s, i) => <div key={s.key} className={
					(s.state ? "w-full bg-slate-400 " : "")
					+ "w-full rounded-b last:rounded-b-none "
					+ (i != 0 || ii == 0 && !props.isOnNow ? "rounded-t " : "rounded-t-none ")
					} style={{height: (s.percent * 100) + "%"}}>
				</div>)}
			</div>
		</div>)}
	</div>;
}