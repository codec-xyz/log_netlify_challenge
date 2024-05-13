"use client";
import { useContext } from "react";
import { DBContext } from "~/components/DBLoadServerRenderData";
import { useDatabaseWorkspace } from "~/utils/clientDBFunctions";
import { AppHeader } from "~/components/AppHeader";
import ViewPages from "~/components/ViewPage";
import { useAuth } from "@clerk/nextjs";

export default function Home(props: { params: { page: string } }) {
	const auth = useAuth();
	const db = useContext(DBContext);
	const workspace = useDatabaseWorkspace(db);

	return <div className="w-full h-screen flex flex-col">
		<AppHeader viewPageIndex={-5} />
		<pre className="overflow-auto p-8">
			Some data...<br />
			Your UserId: {auth.userId}<br />
			Your tags: { db.userData.tags.map(tag => `\n - [id: ${tag.id}], name: ${tag.name}, properties: ${tag.properties}, version: ${tag.version}, viewers: ${tag.viewers}, logEditors: ${tag.logEditors}`)}<br />
			Shared with you tags: { [...db.sharedWithMeTags].map(tag => tag[1]).map(tag => `\n - [id: ${tag.id}], name: ${tag.name}, properties: ${tag.properties}, version: ${tag.version}, viewers: ${tag.viewers}, logEditors: ${tag.logEditors}`)}<br />
			ClientDB: {JSON.stringify(db, null, "\t")}<br />
			Logs: {JSON.stringify([...db.logs].map(a => a[1]), null, "\t")}<br />
		</pre>
	</div>;
}