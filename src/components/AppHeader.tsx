import { SignedOut, SignInButton, SignUpButton, SignedIn, UserButton, useAuth } from "@clerk/nextjs";
import { nanoid } from "nanoid";
import { Fragment, useContext, useRef, useState } from "react";
import { useSyncMode, setWorkspace, SyncMode, setSyncMode, useDatabaseWorkspace } from "~/utils/clientDBFunctions";
import { useLocalStorageMode, setLocalStorageMode } from "~/utils/localStorageDB";
import { DBContext } from "./DBLoadServerRenderData";
import { ViewPage } from "~/utils/dataSchema";
import DropdownSvg from "/public/Icon_Dropdown.svg"
import PlusThinnerSvg from "/public/Icon_PlusThinner.svg"
import { useRouter } from "next/navigation";

export function AppHeader(props: { viewPageIndex: number }) {
	const auth = useAuth();
	const db = useContext(DBContext);
	const workspace = useDatabaseWorkspace(db);
	const syncMode = useSyncMode();
	const localStorageMode = useLocalStorageMode();
	const router = useRouter();

	function addPage() {
		const version = new Date().getTime();
		workspace.viewPages.push({
			id: nanoid(),
			name: 'Page',
			version: version,
			views: [],
		});
		workspace.version = version;
		setWorkspace(db, workspace);
	}

	let value = 'Normal';
	if(syncMode == SyncMode.Offline) value = 'Offline';
	if(syncMode == SyncMode.Frequent) value = 'Frequent';

	const [state, setState] = useState<{ x: number, y: number, viewPageId: string } | undefined>(undefined);
	const popup = useRef<HTMLDivElement>(null);
	let textInputRef = useRef<HTMLInputElement>(null);

	const width = 400;
	const style = { display: state ? undefined : 'none', left: `${state?.x ?? '0'}px`, top: `${state?.y ?? '0'}px`, width: `${width}px` };

	const popupOutClickListener = (event: any) => {
		if(popup.current && !popup.current.contains(event.target)) {
			window.removeEventListener('click', popupOutClickListener);
			setState(undefined);
		}
	}

	function pageEditPopup(e: any, viewPage: ViewPage) {
		e.stopPropagation();
		if(!state) {
			setState({
				x: Math.min(Math.max(0, e.target.getBoundingClientRect().left), window.innerWidth - width),
				y: e.target.getBoundingClientRect().bottom,
				viewPageId: viewPage.id,
			});
			window.addEventListener('click', popupOutClickListener, {capture: true});
		}
		else setState(undefined);
	}

	return <>
		<div className="flex gap-4 border-b border-slate-400 py-2 px-4 items-center">
			<div className="text-2xl font-bold">Log</div>
			<div className="flex-grow"></div>
			<div className="flex flex-col">
				<div>Local Storage</div>
				<select value={localStorageMode ? 'on' : 'off'} onChange={(e) => {setLocalStorageMode(e.target.value === 'on')}}>
					<option value='on'>On</option>
					<option value='off'>Off</option>
				</select>
			</div>
			<div className="flex flex-col">
				<div>Sync Mode</div>
				<select value={value} onChange={(e) => {
					if(!auth.userId && syncMode == SyncMode.Offline) return;
					else if(!auth.userId) { setSyncMode(db, SyncMode.Offline); return; }

					let value = SyncMode.Normal;
					if(e.target.value == 'Offline') value = SyncMode.Offline;
					//if(e.target.value == 'Frequent') value = SyncMode.Frequent;
					setSyncMode(db, value);
				}}>
					<option value='Offline'>Offline</option>
					<option value='Normal'>Normal</option>
					{/* <option value='Frequent'>Frequent</option> */}
				</select>
			</div>
			<SignedOut>
				<SignInButton>
					<button className="w-[100px] rounded-xl border border-slate-400 px-4 py-2 transition hover:bg-slate-200">
						Sign In
					</button>
				</SignInButton>
				<SignUpButton>
					<button className="w-[100px] rounded-xl bg-gradient-to-l from-slate-200 to-slate-300 px-4 py-2 transition hover:bg-slate/50 hidden md:block">
						Sign Up
					</button>
				</SignUpButton>
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</div>
		<div className="flex border-b border-slate-400 overflow-auto shrink-0">
			{workspace.viewPages.map((viewPage, i) => <Fragment key={viewPage.id}>
				<div className={"flex px-4 py-2 items-center transition hover:bg-slate-100 select-none cursor-pointer " + (i == props.viewPageIndex ? "shadow-[inset_0_-4px_0_0] shadow-slate-400" : "")} onClick={() => router.push(`/app/v/${viewPage.id}`)}>
					<div className="px-4 text-nowrap text-ellipsis">
					{viewPage.name}
					</div>
					<button className="fill-slate-400 p-1 rounded-full hover:bg-slate-200" onClick={(e) => pageEditPopup(e, viewPage)}>
						<DropdownSvg className="" />
					</button>
				</div>
			</Fragment>)}
				<div className={"flex px-4 py-2 items-center transition hover:bg-slate-100 select-none cursor-pointer " + (-5 == props.viewPageIndex ? "shadow-[inset_0_-4px_0_0] shadow-slate-400" : "")} onClick={() => router.push(`/app/data`)}>
					<div className="px-4 text-nowrap text-ellipsis">
					Data
					</div>
				</div>
			<div onClick={addPage} className="flex w-16 transition hover:bg-slate-100 select-none cursor-pointer ">
				<div className="m-auto text-2xl">
					<PlusThinnerSvg className="box-content" width="10" height="10" viewBox="0 0 16 16" />
				</div>
			</div>
		</div>
		<div ref={popup} className="z-50 absolute rounded-lg border border-slate-200 bg-white p-4 drop-shadow-4xl" style={style}>
			<div className="text-sm text-slate-500 px-1">Page Name</div>
			<input ref={textInputRef} type="text" value={workspace.viewPages.find(e => e.id == state?.viewPageId)?.name ?? ""} className="border border-slate-400 rounded-md px-2 py-1 w-full" onChange={e => {workspace.viewPages.find(e => e.id == state?.viewPageId!)!.name = e.target.value; setWorkspace(db, workspace)}}></input>
			<div className="grid grid-cols-[1fr_1fr] gap-4 pt-4">
				<button className="nt-semibold text-slate-500 border border-slate-500 px-2 py-2 rounded transition hover:bg-slate-500 hover:text-white" onClick={() => {
					window.removeEventListener('click', popupOutClickListener);
					setState(undefined);
				}}>Done</button>
				<button className="nt-semibold text-red-500 border border-red-500 px-2 py-2 rounded transition hover:bg-red-500 hover:text-white" onClick={() => {
					const version = new Date().getTime();
					workspace.viewPages = workspace.viewPages.filter(p => p.id != state!.viewPageId);
					workspace.version = version;
					setWorkspace(db, workspace);
					window.removeEventListener('click', popupOutClickListener);
					setState(undefined);
				}}>Delete Page</button>
			</div>
		</div>
	</>
}