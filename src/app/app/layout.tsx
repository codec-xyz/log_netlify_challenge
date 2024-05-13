import { auth } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";
import { DBLoadServerRenderData } from "~/components/DBLoadServerRenderData";
import { getDB } from "~/utils/clientDB";
import { updateServerData } from "~/utils/serverDBFunctions";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const db = getDB();

	const user = auth();

	const cookieStore = cookies();
	
	if(user.userId && cookieStore.get('LogSyncMode')?.value != 'Offline') {
		const headersList = headers();
		const url = new URL(headersList.get('referer') ?? 'https://a');
		const urlSeg = url.pathname.slice(1).split('/');
		if(urlSeg[0] == 'app' && urlSeg[1] == 'v') {
			await updateServerData(db, urlSeg[2], urlSeg[3]);
		}
		else if(urlSeg[0] == 'app' && urlSeg[1] == undefined) {
			await updateServerData(db, '');
		}
		else {
			await updateServerData(db);
		}
	}

	return <>
		<DBLoadServerRenderData data={db}>
			{children}
		</DBLoadServerRenderData>
	</>;
}