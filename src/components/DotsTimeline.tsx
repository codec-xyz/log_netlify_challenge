import { LogGroup, PropertyId } from "~/utils/dataSchema";
import CheckmarkSvg from "/public/Icon_Checkmark.svg"

export function DotsTimeline(props: { time: number, length: number, logGroup: LogGroup, timePropName: PropertyId }) {
	const startTime = props.time - props.length;
	const endTime = props.time;

	const dots = props.logGroup.entries.filter(e => startTime <= e[props.timePropName] && e[props.timePropName] <= endTime)
	.map(e => ({
		key: e.id,
		time: (e[props.timePropName] - startTime) / props.length,
	}));

	return <div className="flex items-center bg-slate-200 relative overflow-hidden h-[3rem]">
		{dots.map((s, i) => <div key={s.key} className="size-[2rem] rounded-full bg-slate-400 absolute flex items-center justify-center" style={{ left: `calc(${(1 - s.time) * 100}% - 1rem)` }}>
			<CheckmarkSvg className="box-content fill-slate-200" width="16" height="16" viewBox="0 0 16 16"/>
		</div>)}
	</div>;
}