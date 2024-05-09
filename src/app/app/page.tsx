"use client";
import { View_PlayPause, View_PlayPause_Render } from "~/components/View_PlayPause";
import { useDatabaseWorkspace } from "~/utils/data";
import { View, ViewPage, ViewTypes } from "~/utils/viewData";

function RenderLog(view: View) {
	if(view.type == ViewTypes.Single_PlayPause) return <View_PlayPause_Render view={view.info as View_PlayPause} />;
	else return <>Type {view.type} Not Implemented!</>
}

export default function Home() {
	const workspace = useDatabaseWorkspace();

	return (
		<>
			{(workspace.viewPages[0] as ViewPage).views.map(view => <div key={view.v_id} className="border border-slate-400 my-2">
				{RenderLog(view)}
			</div>)}
		</>
	);
}