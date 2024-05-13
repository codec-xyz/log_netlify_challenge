import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from "~/trpc/react";
import { ServerRenderTimeCapture, TimedUpdateProvider } from "~/components/TimedUpdateProvider";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const metadata = {
	title: "Log Demo",
	description: "Log Demo App",
	icons: [{ rel: "icon", url: "/Icon_CheckmarkEmpty.svg" }],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<ServerRenderTimeCapture time={new Date()}></ServerRenderTimeCapture>
			<TRPCReactProvider>
				<TimedUpdateProvider interval={60 * 1000}>
					<html lang="en">
						<body className={`font-sans ${inter.variable}`}>
							{children}
						</body>
					</html>
				</TimedUpdateProvider>
			</TRPCReactProvider>
		</ClerkProvider>
	);
}