import { api } from "~/trpc/server";
import { ClientDB, getAllEssentials_makeRequestData, getAllEssentials_saveResponse, getLogs_makeRequestData, getLogs_saveResponse } from "./clientDB";
import { ExArr, mapMap } from "./ExArr";
import { PropertyId, View, ViewPage } from "./dataSchema";

export async function updateServerUserData(db: ClientDB) {
	const requestData = getAllEssentials_makeRequestData(db);
	let result = await api.db.getAllEssentials(requestData);
	if(result.userDoesNotExist) {
		await api.db.initUserData();
		result = await api.db.getAllEssentials(requestData);
	}
	getAllEssentials_saveResponse(db, result);
}

export async function updateServerData(db: ClientDB, viewPage?: string, view?: string) {
	await updateServerUserData(db);

	let loadViewPage: ViewPage | undefined;
	let loadView: View | undefined;

	if(viewPage === "") loadViewPage = db.userData.workspace.viewPages[0];
	else if(viewPage !== undefined) loadViewPage = db.userData.workspace.viewPages.find(a => a.id === viewPage);
	if(loadViewPage) loadView = loadViewPage.views.find(a => a.id === view);

	let views: View[] = [];
	if(loadView) views.push(loadView);
	else if(loadViewPage) views.push(...loadViewPage.views);

	const startTime = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);

	const reqArr = views.map(v => ({
		id: v.info.tag,
		startTime
	}));
	const requestData = getLogs_makeRequestData(db, reqArr);
	let result = await api.db.getLogs(requestData);
	getLogs_saveResponse(db, result);
}