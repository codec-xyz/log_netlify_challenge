"use client";
import { Fragment } from "react";
import { View_Checkmark, View_Checkmark_Render } from "~/components/View_Checkmark";
import { View_PlayPause, View_PlayPause_Render } from "~/components/View_PlayPause";
import { useDatabaseWorkspace } from "~/utils/data";
import { View, ViewPage, ViewTypes } from "~/utils/dataSchema";

function RenderLog(view: View) {
	if(view.type == ViewTypes.PlayPause) return <View_PlayPause_Render view={view.info as View_PlayPause} />;
	if(view.type == ViewTypes.Checkmark) return <View_Checkmark_Render view={view.info as View_Checkmark} />;
	else return <div className="pl-2">Type {view.type} Not Implemented!</div>
}

export default function Home() {
	const workspace = useDatabaseWorkspace();

	return <>
		<div className="h-16 border-b border-slate-400 p-2">
			Header
		</div>
		<div className="flex flex-col gap-2 my-2">
			{(workspace.viewPages[0] as ViewPage).views.map((view, i) => <Fragment key={view.id}>
				{/* {i != 0 && <div className="bg-slate-200 h-0.5"></div>} */}
				{RenderLog(view)}
			</Fragment>)}
		</div>
	</>;
}