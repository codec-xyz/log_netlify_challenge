import { SignInButton, SignOutButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { api } from "~/trpc/server";

export default async function Home() {
	const { userId } = auth();

	return <div className="w-full h-screen flex flex-col overflow-auto">
		<div className="flex gap-4 py-4 px-8 items-center">
			<div className="text-3xl font-bold">Log</div>
			<Link href="/app">App</Link>
			<Link href="/app">Github</Link>
			<div className="flex-grow"></div>
			<SignedOut>
				<SignInButton>
					<button className="rounded border-slate-400 px-4 py-2 transition hover:bg-slate-200">
						Sign In
					</button>
				</SignInButton>
				<SignUpButton>
					<button className="rounded bg-slate-200 px-4 py-2 transition hover:bg-white/20">
						Sign Up
					</button>
				</SignUpButton>
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</div>
	</div>;
}
