"use client";
import { useAuth } from "@clerk/nextjs";
import _ from "lodash";
import { createContext, useEffect } from "react";
import { ClientDB } from "~/utils/clientDB";
import { SyncMode, setSyncMode, syncMode } from "~/utils/clientDBFunctions";
import { PopulateClientDBOnLoad, localStorageMode, setLocalStorageMode } from "~/utils/localStorageDB";

export const DBContext = createContext<ClientDB>(null as any);

export function DBLoadServerRenderData(props: { data: ClientDB, children?: React.ReactNode,  }) {
	const auth = useAuth();
	const db = props.data;

	useEffect(() => {
		if(auth.userId == undefined) {
			setSyncMode(null as any, SyncMode.Offline);
		}
	}, [auth])

	useEffect(() => {
		PopulateClientDBOnLoad(db);
		db.userData = _.cloneDeep(db.userData);
		db.workspaceWatchers.forEach((_, fn) => fn());
		db.propsAndTagsWatchers.forEach((_, fn) => fn());
	}, []);

	return <DBContext.Provider value={db}>
		{props.children}
	</DBContext.Provider>;
}