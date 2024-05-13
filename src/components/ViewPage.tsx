import { nanoid } from "nanoid";
import { Fragment, useContext, useRef, useState } from "react";
import { View_Checkmark, View_Checkmark_Render, View_Checkmark_Type } from "~/components/View_Checkmark";
import { View_PlayPause, View_PlayPause_Render, View_PlayPause_Type } from "~/components/View_PlayPause";
import { useDatabaseWorkspace, useSyncMode, setWorkspace, SyncMode, setTag } from "~/utils/clientDBFunctions";
import { LogProperty_Time, Tag, View, ViewPage, ViewTypes } from "~/utils/dataSchema";
import { useLocalStorageMode } from "~/utils/localStorageDB";
import { DBContext } from "./DBLoadServerRenderData";
import { useRouter } from "next/navigation";
import GearSvg from "/public/Icon_Gear.svg"
import { useAuth } from "@clerk/nextjs";

function RenderLog(view: View) {
	if(view.type == ViewTypes.PlayPause) return <View_PlayPause_Render view={view.info as View_PlayPause} />;
	if(view.type == ViewTypes.Checkmark) return <View_Checkmark_Render view={view.info as View_Checkmark} />;
	else return <div className="pl-2">Type {view.type} Not Implemented!</div>
}

export default function ViewPages(props: { viewPage?: ViewPage }) {
	const auth = useAuth();
	const db = useContext(DBContext);
	const workspace = useDatabaseWorkspace(db);
	const syncMode = useSyncMode();
	const localStorageMode = useLocalStorageMode();
	const router = useRouter();

	function addPage() {
		const version = new Date().getTime();
		const id = nanoid();
		workspace.viewPages.push({
			id: id,
			name: 'Page',
			version: version,
			views: [],
		});
		workspace.version = version;
		setWorkspace(db, workspace);
		router.push(`/app/v/${id}`);
	}

	let value = 'Normal';
	if(syncMode == SyncMode.Offline) value = 'Offline';
	if(syncMode == SyncMode.Frequent) value = 'Frequent';

	const [state, setState] = useState<{ s: number, x: number, y: number, view: string | undefined }>({s: 0, x: 0, y: 0, view: undefined});
	const popupType = useRef<HTMLDivElement>(null);
	const popupSettings = useRef<HTMLDivElement>(null);
	const viewLabelInputRed = useRef<HTMLInputElement>(null);
	const tagIdInputRef = useRef<HTMLInputElement>(null);
	const shareViewsInputRef = useRef<HTMLInputElement>(null);
	const shareEditorsInputRef = useRef<HTMLInputElement>(null);

	const [tagIdInput, setTagIdInput] = useState<string>("");
	const [shareViewsInput, setShareViewsInput] = useState<string>("");
	const [shareEditorsInput, setShareEditorsInput] = useState<string>("");

	const width = 400;
	const style = { left: `${state?.x ?? '0'}px`, top: `${state?.y ?? '0'}px`, width: `${width}px` };

	const popupOutClickListener = (event: any) => {
		if(state.s == 0) window.removeEventListener('click', popupOutClickListener);
		if(popupType.current && !popupType.current.contains(event.target)) {
			turnOffPopup();
		}
		if(popupSettings.current && !popupSettings.current.contains(event.target)) {
			turnOffPopup();
		}
	}

	function turnOffPopup() {
		window.removeEventListener('click', popupOutClickListener);
		setState({s: 0, x: 0, y: 0, view: undefined});
	}

	function openPopup(e: any, s: number, view?: string) {
		if(state.s == 0) {
			const rect = e.target.getBoundingClientRect();
			let center = rect.left * 0.5 + rect.right * 0.5 - width * 0.5;
			setState({
				s: s,
				x: Math.max(0, Math.min(center, window.innerWidth - width)),
				y: rect.bottom,
				view: view,
			});
			window.addEventListener('click', popupOutClickListener, { capture: true });
		}
		else setState({s: 0, x: 0, y: 0, view: undefined});
	}
	
	return <>
		{props.viewPage && props.viewPage.views.length > 0 && <div className="flex flex-col gap-2 my-2">
			{props.viewPage.views.map((view, i) => <Fragment key={view.id}>
				<div className="flex">
					<button className="p-2 select-none cursor-pointer transition hover:bg-slate-200" onClick={(e) => {
						openPopup(e, 2, view.id);
						setTagIdInput(view.info.tag ?? "");
						setShareViewsInput("");
						setShareEditorsInput("");
						if(view.info.tag == undefined || view.info.tag === '') return;
						const tag = db.tagGraph.get(view.info.tag);
						if(!tag) return;
						setShareViewsInput(tag.tag.viewers.join(";"));
						setShareEditorsInput(tag.tag.logEditors.join(";"));
					}}>
						<GearSvg width="12px" height="12px" />
					</button>
					<div className="grow">
						{RenderLog(view)}
					</div>
				</div>
			</Fragment>)}
		</div>}

		{!props.viewPage && <div className="flex grow p-4">
			<div className="font-bold text-slate-500 m-auto border border-slate-400 py-4 px-8 rounded-full select-none cursor-pointer transition hover:bg-slate-400 hover:text-white" onClick={addPage}>Make a view page</div>
		</div>}

		{props.viewPage && <div className={"flex grow p-4 " + (props.viewPage.views.length == 0 ? " " : "")}>
			<div className="font-bold text-slate-400 m-auto border border-slate-400 py-4 px-8 rounded-full select-none cursor-pointer transition hover:bg-slate-400 hover:text-white" onClick={(e) => {openPopup(e, 1)}}>+ Add a view</div>
		</div>}

		{state.s == 2 && <div ref={popupSettings} className="z-50 absolute rounded-lg border border-slate-200 bg-white p-4 drop-shadow-4xl flex flex-col max-w-[100vw]" style={style}>
			<div className="flex w-full gap-4 mb-4">
				<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white w-full" onClick={() => {
					const index = props.viewPage!.views.findIndex(v => v.id == state?.view);
					if(index == -1 || index == 0) return;
					const version = new Date().getTime();
					let temp = props.viewPage!.views[index]!;
					props.viewPage!.views[index]! = props.viewPage!.views[index - 1]!;
					props.viewPage!.views[index - 1] = temp;
					props.viewPage!.views[index]!.version = version;
					props.viewPage!.views[index - 1]!.version = version;
					props.viewPage!.version = version;
					workspace.version = version;
					setWorkspace(db, workspace);
				}}>↑ Move Up</button>
				<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white w-full" onClick={() => {
					const index = props.viewPage!.views.findIndex(v => v.id == state?.view);
					if(index == -1 || index == props.viewPage!.views.length - 1) return;
					const version = new Date().getTime();
					let temp = props.viewPage!.views[index]!;
					props.viewPage!.views[index]! = props.viewPage!.views[index + 1]!;
					props.viewPage!.views[index + 1] = temp;
					props.viewPage!.views[index]!.version = version;
					props.viewPage!.views[index + 1]!.version = version;
					props.viewPage!.version = version;
					workspace.version = version;
					setWorkspace(db, workspace);
				}}>Move Down ↓</button>
			</div>
			<div className="text-sm text-slate-500 px-1 mb-1">View Label</div>
			<input ref={viewLabelInputRed} type="text" className="border border-slate-400 rounded-md px-2 py-1 w-full mb-4" value={props.viewPage!.views.find(v => v.id == state?.view)?.info.name} onChange={e => {
				props.viewPage!.views.find(v => v.id == state!.view)!.info.name = e.target.value; setWorkspace(db, workspace);
			}}></input>
			<div className="text-sm text-slate-500 px-1 mb-1">TagId</div>
			<input ref={tagIdInputRef} type="text" className="border border-slate-400 rounded-md px-2 py-1 w-full mb-4" value={tagIdInput} onChange={e => setTagIdInput(e.target.value)}></input>
			<div className="text-sm text-slate-500 px-1 mb-1">Share Viewers (semicolon seperated list)</div>
			<input ref={shareViewsInputRef} type="text" className="border border-slate-400 rounded-md px-2 py-1 w-full mb-4" value={shareViewsInput} onChange={e => setShareViewsInput(e.target.value)}></input>
			<div className="text-sm text-slate-500 px-1 mb-1">Share Editors (semicolon seperated list)</div>
			<input ref={shareEditorsInputRef} type="text" className="border border-slate-400 rounded-md px-2 py-1 w-full mb-4" value={shareEditorsInput} onChange={e => setShareEditorsInput(e.target.value)}></input>
			<div className="grid grid-cols-[1fr_1fr] gap-4 pt-4">
				<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white" onClick={() => {
					const view = props.viewPage!.views.find(v => v.id == state?.view);
					if(view == undefined) return;
					view.info.tag = tagIdInput;
					const version = new Date().getTime();
					view.version = version;
					props.viewPage!.version = version;
					workspace.version = version;
					setWorkspace(db, workspace);

					const tag = db.tagGraph.get(view.info.tag);
					if(tag) {
						if(tag.tag.viewers.join(";") != shareViewsInput
						|| tag.tag.logEditors.join(";") != shareEditorsInput) {
							tag.tag.viewers = shareViewsInput.split(";");
							tag.tag.logEditors = shareEditorsInput.split(";");
							setTag(db, tag.tag);
						}
					}

					turnOffPopup();
				}}>Done</button>
				<button className="nt-semibold text-red-500 border border-red-500 px-2 py-2 rounded transition hover:bg-red-500 hover:text-white" onClick={() => {
					props.viewPage!.views = props.viewPage!.views.filter(v => v.id != state?.view);
					const version = new Date().getTime();
					props.viewPage!.version = version;
					workspace.version = version;
					setWorkspace(db, workspace);
					turnOffPopup();
				}}>Delete</button>
			</div>
			
		</div>}

		{state.s == 1 && <div ref={popupType} className="z-50 absolute rounded-lg border border-slate-200 bg-white p-4 drop-shadow-4xl flex flex-col gap-4 max-w-[100vw]" style={style}>
			<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white" onClick={() => {
				if(!props.viewPage) return;
				const version = new Date().getTime();

				let tagId = (auth.userId ?? "") + "+" + nanoid();
				let newTag: Tag = {
					version, id: tagId, name: 'AutoGeneratedTag_'+ nanoid(), tags: [], properties: [LogProperty_Time, 'id_of_SysOnOffBoolProp'], viewers: [], logEditors: [],
				};
				setTag(db, newTag);

				props.viewPage.views.push({
					version: version,
					id: nanoid(),
					type: ViewTypes.PlayPause,
					info: {
						name: 'Title here',
						tag: tagId,
						type: View_PlayPause_Type.Horizontal
					}
				});
				props.viewPage.version = version;
				workspace.version = version;
				setWorkspace(db, workspace);
				turnOffPopup();
				}}>Horizontal Timeline</button>
			<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white" onClick={() => {
				if(!props.viewPage) return;
				const version = new Date().getTime();

				let tagId = (auth.userId ?? "") + "+" + nanoid();
				let newTag: Tag = {
					version, id: tagId, name: 'AutoGeneratedTag_'+ nanoid(), tags: [], properties: [LogProperty_Time, 'id_of_SysOnOffBoolProp'], viewers: [], logEditors: [],
				};
				setTag(db, newTag);

				props.viewPage.views.push({
					version: version,
					id: nanoid(),
					type: ViewTypes.PlayPause,
					info: {
						name: 'Title here',
						tag: tagId,
						type: View_PlayPause_Type.VerticalZigZag
					}
				});
				props.viewPage.version = version;
				workspace.version = version;
				setWorkspace(db, workspace);
				turnOffPopup();
				}}>Vertizal Zig Zag Timeline</button>
			<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white" onClick={() => {
				if(!props.viewPage) return;
				const version = new Date().getTime();

				let tagId = (auth.userId ?? "") + "+" + nanoid();
				let newTag: Tag = {
					version, id: tagId, name: 'AutoGeneratedTag_'+ nanoid(), tags: [], properties: [LogProperty_Time], viewers: [], logEditors: [],
				};
				setTag(db, newTag);

				props.viewPage.views.push({
					version: version,
					id: nanoid(),
					type: ViewTypes.Checkmark,
					info: {
						name: 'Title here',
						tag: tagId,
						type: View_Checkmark_Type.DotsTimeline
					}
				});
				props.viewPage.version = version;
				workspace.version = version;
				setWorkspace(db, workspace);
				turnOffPopup();
				}}>Dots Timeline</button>
			<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white" onClick={() => {
				if(!props.viewPage) return;
				const version = new Date().getTime();

				let tagId = (auth.userId ?? "") + "+" + nanoid();
				let newTag: Tag = {
					version, id: tagId, name: 'AutoGeneratedTag_'+ nanoid(), tags: [], properties: [LogProperty_Time], viewers: [], logEditors: [],
				};
				setTag(db, newTag);

				props.viewPage.views.push({
					version: version,
					id: nanoid(),
					type: ViewTypes.Checkmark,
					info: {
						name: 'Title here',
						tag: tagId,
						type: View_Checkmark_Type.DailyCheckmark
					}
				});
				props.viewPage.version = version;
				workspace.version = version;
				setWorkspace(db, workspace);
				turnOffPopup();
				}}>Check Markmark Timeline</button>
		</div>}
	</>;
}