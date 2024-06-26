"use client";
import { useContext } from "react";
import { DBContext } from "~/components/DBLoadServerRenderData";
import { useDatabaseWorkspace } from "~/utils/clientDBFunctions";
import { AppHeader } from "~/components/AppHeader";
import ViewPages from "~/components/ViewPage";

export default function Home() {
	const db = useContext(DBContext);
	const workspace = useDatabaseWorkspace(db);

	const viewPage = workspace.viewPages[0];

	return <div className="w-full h-screen flex flex-col overflow-auto">
		<AppHeader viewPageIndex={0} />
		<ViewPages viewPage={viewPage} />
	</div>;
}