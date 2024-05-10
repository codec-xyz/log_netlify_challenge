import { calcRenderSegments } from "~/utils/timeline";
import { LogGroup, PropertyId } from "~/utils/dataSchema";

export function HorizontalTimeline(props: { time: number, length: number, logGroup: LogGroup, timePropName: PropertyId, boolPropName: PropertyId, isOnNow: boolean }) {
	const startTime = props.time - props.length;
	const endTime = props.time;
	const segments = calcRenderSegments(startTime, endTime, props.logGroup.entries, props.timePropName, props.boolPropName, false);

	return <div className="h-16 flex items-center bg-slate-200">
		{segments.map((s, i) => <div key={s.key} className={
			(s.state ? "h-full bg-slate-400 rounded " : "")
			+ (i == 0 && props.isOnNow ? "rounded-l-none " : "")
			+ "last:rounded-r-none"
			} style={{width: s.percent * 100 + "%"}}></div>
		)}
	</div>;
}