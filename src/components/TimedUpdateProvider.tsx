"use client";

import { createContext, useEffect, useRef, useState } from "react";

export let ServerRenderTime = new Date(0);
export const TimedUpdateContext = createContext(new Date(0));

export function useFirstRenderFallback<T>(realValue: () => T, fallbackValue: () => T): T {
	const ref = useRef(true);
	const firstRender = ref.current;
	ref.current = false;
	return firstRender ? fallbackValue() : realValue();
}

/**
 * Needs to be called from a non 'use client' component.
 * The time property will be rendered on the server and send to the
 * client because this component has 'use client' and the parent does
 * not. If the parent component had 'use client' and value would not
 * be sent and instead rerendered on the client.
 */
export function ServerRenderTimeCapture({ time }: { time: Date }) {
	ServerRenderTime = time;
	return <></>;
}

export function TimedUpdateProvider({
	interval, children
}: {
	interval: number,
	children?: React.ReactNode,
}) {
	const [time, setTime] = useState(ServerRenderTime);

	useEffect(() => {
		const intervalId = setInterval(() => setTime(new Date()), interval);
		return () => clearInterval(intervalId);
	}, [interval]);

	return <TimedUpdateContext.Provider value={time}>
		{children}
	</TimedUpdateContext.Provider>;
}