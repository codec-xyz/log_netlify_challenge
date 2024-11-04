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
	<div className="max-w-screen-xl m-auto p-8 flex gap-4 items-center justify-between relative z-10">
		<div className="text-3xl font-bold">Log <span className="text-xl font-normal text-neutral-600">(Demo)</span></div>
		<div className="flex gap-4">
			<ClerkLoading>
					<button className="w-[100px] rounded-xl border border-slate-400 px-4 py-2 transition hover:bg-slate-200" disabled>
						Sign In
					</button>
					<button className="w-[100px] rounded-xl bg-gradient-to-l from-slate-200 to-slate-300 px-4 py-2 transition hover:bg-white/20 hidden sm:block" disabled>
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
					<button className="w-[100px] rounded-xl bg-gradient-to-l from-slate-200 to-slate-300 px-4 py-2 transition hover:bg-slate/50 hidden sm:block">
						Sign Up
					</button>
				</SignUpButton>
			</SignedOut>
			<SignedIn>
				<UserButton />
			</SignedIn>
		</div>
	</div>
	<div className="max-w-screen-xl m-auto p-8 flex min-h-screen mt-[-106px] items-stretch max-xl:flex-col max-xl:pt-[122px]">
		<div className="flex flex-col items-center shrink-0">
			<div className="grow min-h-[106px] max-xl:hidden"></div>
			<div className="py-8 xl:px-8 box-content max-w-[400px] shrink-0">
				<h1 className="text-6xl font-bold">Keep Track of Life</h1>
				<p className="pt-2">Log your life as seamlessly as possible and gain insights.</p>
				<div className="pt-4 flex gap-4 items-center flex-wrap">
				<Link className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 select-none cursor-pointer" href="/app">
					Try It Out
				</Link>
				<Link  className="px-6 py-3 transitions rounded-xl font-bold text-white bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 select-none cursor-pointer" href="https://github.com/codec-xyz/track_netlify_challenge">
					Github
				</Link>
				</div>
			</div>
			<div className="grow max-xl:hidden"></div>
		</div>
		<div className="flex flex-col xl:mr-[calc(clamp(-300px,-1*(100vw-1280px+64px)/2,0px))] max-xl:grow max-xl:pb-8 max-xl:-mx-8">
			<div className="grow-[3] min-h-[106px] max-xl:hidden"></div>
			<Image src="/preview001.png" width={2645} height={1422} alt="Preview" className="min-w-0 w-full max-xl:w-full max-xl:grow object-cover object-[60%]" />
			<div className="grow max-xl:hidden"></div>
		</div>
	</div>

	<div className="max-w-screen-md m-auto p-8">
		<p>This was created for the Netlify Dynamic Site Challenge and is only a demo.</p>
		<h1 className="text-3xl font-bold">It started with an overly ambitious sketch...</h1>
		<p>I decided on an idea thats been rattling around in my head for a while.</p>
	</div>
	<Image src="/preview004.png" width={6869} height={4320} alt="Sketch" className="w-full mx-auto w-auto" />
	<div className="max-w-screen-md m-auto p-8 justify-self-center">
		<p>The app lets you keep track of various types of data in so called 'logs'. It's displayed visually to let you look back in time and keep track of activities. The data can be saved locally or to the cloud. Logs can also be shared with others.</p>
		<p>This app was built using Create T3 from which I used NextJS, tRPC, and Tailwind CSS. Clerk for auth. And Netlify for the server hosting as well as Netlify's Blobs as simple key value store used for storing app data.</p>
		<p>I will admit the db code is a bit of a mess. It became overly complicated by the end as I was too ambitious but needed to get something out by the deadline. I wouldn't be surprised to find some bugs. Although I got it more or less working in the end. :)</p>
		<p>Now just try it out...</p>
		<div className="flex py-5 justify-center">
			<Link className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 select-none cursor-pointer" href="/app">
				Try It Out
			</Link>
		</div>
	</div>
	<div className="bg-slate-500 w-full h-[400px] mt-8 text-white flex flex-col items-center justify-center gap-2">
		<div>Log by</div>
		<svg className="w-32 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 4" role="img" aria-label="codec logo">
			<path d="M0 4h2v-2h-2z M3  4h2v-2h-2z  M6 4h2v-4h-1v2h-1z  M9 4h2v-2h-2z  M12 4h2v-2h-2z"></path>
		</svg>
	</div>
	</div>;
}
