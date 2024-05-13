"use client";
import { useContext } from "react";
import { DBContext } from "~/components/DBLoadServerRenderData";
import { useDatabaseWorkspace } from "~/utils/clientDBFunctions";
import { AppHeader } from "~/components/AppHeader";
import ViewPages from "~/components/ViewPage";

export default function Home(props: { params: { page: string } }) {
	const db = useContext(DBContext);
	const workspace = useDatabaseWorkspace(db);

	const viewPageIndex = workspace.viewPages.findIndex(p => p.id == props.params.page);
	const viewPage = workspace.viewPages[viewPageIndex]!;

	return <div className="w-full h-screen flex flex-col">
		<AppHeader viewPageIndex={viewPageIndex} />
		<ViewPages viewPage={viewPage} />
	</div>;
}