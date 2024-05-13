import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", ...fontFamily.sans],
			},
			dropShadow: {
				'3xl': '0 35px 35px rgba(0, 0, 0, 0.25)',
				'4xl': [
					'0 5px 15px rgba(0, 0, 0, 0.08)',
					'0 15px 35px rgba(25, 28, 33, 0.2)',
				]
			}
		},
	},
	plugins: [],
} satisfies Config;
