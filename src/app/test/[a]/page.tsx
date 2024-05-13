import { auth } from "@clerk/nextjs/server";
import { api } from "~/trpc/server";

export default async function WhatWhat(props: { params: { a: string }}) {
	const { userId } = auth();
	const helloMsg = await api.db.getHello({ text: 'codec' });

	return <>
		<div>{helloMsg.greeting}</div>
		<div className="">
			{userId && <span>Logged in as {userId}</span>}
		</div>
		<div>{props.params.a}</div>
	</>;
}