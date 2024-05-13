'use client';
import { ClerkLoading, SignInButton, SignOutButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/server";
import Image from 'next/image';

export default function Home() {
	const router = useRouter();

	return <div className="w-full min-h-screen bg-slate-100">
	<div className="w-full max-w-screen-xl grid grid-rows-[100vh_auto] m-auto">
		<div className="row-[1] col-[1] w-full h-full grid grid-rows-[auto_20%_auto_1fr] m-auto">
			<div className="flex gap-4 p-10 items-center place-self-start w-full justify-between">
				<div className="text-3xl font-bold">Log <span className="text-xl font-normal">(Demo)</span></div>
				<div className="flex gap-x-4">
					<ClerkLoading>
							<button className="w-[100px] rounded-xl border border-slate-400 px-4 py-2 transition hover:bg-slate-200" disabled>
								Sign In
							</button>
							<button className="w-[100px] rounded-xl bg-gradient-to-l from-slate-200 to-slate-300 px-4 py-2 transition hover:bg-white/20 hidden md:block" disabled>
								Sign Up
							</button>
					</ClerkLoading>
					<SignedOut>
						<SignInButton>
							<button className="w-[100px] rounded-xl border border-slate-400 px-4 py-2 transition hover:bg-slate-200">
								Sign In
							</button>
						</SignInButton>
						<SignUpButton>
							<button className="w-[100px] rounded-xl bg-gradient-to-l from-slate-200 to-slate-300 px-4 py-2 transition hover:bg-slate/50 hidden md:block">
								Sign Up
							</button>
						</SignUpButton>
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</div>
			<div className="self-center justify-self-center flex items-center gap-4">
				<Link className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 select-none cursor-pointer" href="/app">
					Try It Out
				</Link>
				<Link  className="px-6 py-3 transitions rounded-xl font-bold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 select-none cursor-pointer" href="https://github.com/codec-xyz/track_netlify_challenge">
					Github
				</Link>
			</div>
			<div className="self-start flex items-center">
				<div className="max-w-[450px] p-10 z-30 rounded-xl">
					<h1 className="text-6xl font-bold">Keep Track of Life</h1>
					<p className="">Log is an idea I've had for a while. Log your life as seamlessly as possible and gain insights. Here is what I was able to make in a week...</p>
				</div>
			</div>
			<Image src="/preview001.png" width={2645} height={1422} alt="Preview" className="place-self-end w-[calc(min(100vw,115vh))] mt-0 xl:mt-[-500px] mr-[calc(min(0px,(100vw-1280px)/-3))] z-0" />
		</div>

		<div className="p-10 mt-[300px] xl:mt-0">
			<p>I saw some sort of Netlify Dynamic Site Challenge</p>
			<h1 className="text-3xl font-bold">An overly ambitious sketch later...</h1>
			<p>I decided on an idea thats been rattling around and morphing in my head for years</p>
		</div>
		<Image src="/preview004.png" width={6869} height={4320} alt="Sketch" className="" />
		<div className="max-w-[500px] p-10 justify-self-center">
			<p>This was built using Create T3 from which I used NextJS, tRPC, and tailwindcss. Clerk does auth. And Netlify for the server hosting. To participate in the challenge I used Netlify's Blobs as simple key value store. And all server saving uses Netlify's Blobs.</p>
			<p>The db code I wrote is an utter mess. It became overwhelmingly complicated by the end and I wouldn't be suprised to find countless bugs. I got it sort of work in the end tho. :)</p>
			<p>Now just try it out...</p>
			<div className="flex py-5 justify-center">
				<Link className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 select-none cursor-pointer" href="/app">
					Try It Out
				</Link>
			</div>
		</div>
	</div>
	<div className="bg-slate-500 w-full h-[400px] mt-[150px] text-white flex justify-center">
		<div className="self-center">
			Log by codec
		</div>
	</div>
	</div>;
}
