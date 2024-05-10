import PlaySvg from "/public/Icon_Play.svg"
import PauseSvg from "/public/Icon_Pause.svg"
import XSvg from "/public/Icon_X.svg"
import XSmallSvg from "/public/Icon_XSmall.svg"
import CheckmarkSvg from "/public/Icon_Checkmark.svg"
import CheckmarkEmptySvg from "/public/Icon_CheckmarkEmpty.svg"

export default function Home() {
	return <>
		<div className="grid w-fit gap-4">
			<div className="grid grid-cols-2 w-fit gap-4 place-items-center">
				<div className="col-[1] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<div className="col-[2] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<PlaySvg className="col-[1] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16"/>
				<PlaySvg className="col-[2] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16" stroke="black" fill="none" stroke-width="0.1px"/>
			</div>
			<div className="grid grid-cols-2 w-fit gap-4 place-items-center">
				<div className="col-[1] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<div className="col-[2] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<PauseSvg className="col-[1] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16"/>
				<PauseSvg className="col-[2] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16" stroke="black" fill="none" stroke-width="0.1px"/>
			</div>
			<div className="grid grid-cols-2 w-fit gap-4 place-items-center">
				<div className="col-[1] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<div className="col-[2] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<XSvg className="col-[1] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16"/>
				<XSvg className="col-[2] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16" stroke="black" fill="none" stroke-width="0.1px"/>
			</div>
			<div className="grid grid-cols-2 w-fit gap-4 place-items-center">
				<div className="col-[1] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<div className="col-[2] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<XSmallSvg className="col-[1] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16"/>
				<XSmallSvg className="col-[2] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16" stroke="black" fill="none" stroke-width="0.1px"/>
			</div>
			<div className="grid grid-cols-2 w-fit gap-4 place-items-center">
				<div className="col-[1] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<div className="col-[2] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<CheckmarkSvg className="col-[1] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16"/>
				<CheckmarkSvg className="col-[2] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16" stroke="black" fill="none" stroke-width="0.1px"/>
			</div>
			<div className="grid grid-cols-2 w-fit gap-4 place-items-center">
				<div className="col-[1] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<div className="col-[2] row-[1] size-[160px] border-2 border-slate-200 box-content"></div>
				<CheckmarkEmptySvg className="col-[1] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16"/>
				<CheckmarkEmptySvg className="col-[2] row-[1] border-[16px] border-slate-400 box-content p-[40px]" width="160px" height="160px" viewBox="0 0 16 16" stroke="black" fill="none" stroke-width="0.1px"/>
			</div>
		</div>
	</>
}