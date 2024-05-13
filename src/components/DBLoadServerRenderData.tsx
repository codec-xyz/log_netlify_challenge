"use client";
import { useAuth } from "@clerk/nextjs";
import { createContext, useEffect } from "react";
import { ClientDB } from "~/utils/clientDB";
import { SyncMode, setSyncMode, syncMode } from "~/utils/clientDBFunctions";
import { PopulateClientDBOnLoad, localStorageMode, setLocalStorageMode } from "~/utils/localStorageDB";

export const DBContext = createContext<ClientDB>(null as any);

export function DBLoadServerRenderData(props: { data: ClientDB, children?: React.ReactNode,  }) {
	const auth = useAuth();

	useEffect(() => {
		if(auth.userId == undefined) {
			setSyncMode(null as any, SyncMode.Offline);
		}
	}, [auth])

	useEffect(() => {
		PopulateClientDBOnLoad(props.data);
	}, []);

	return <DBContext.Provider value={props.data}>
		{props.children}
	</DBContext.Provider>;
}