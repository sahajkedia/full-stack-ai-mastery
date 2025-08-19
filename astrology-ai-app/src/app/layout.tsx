import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Jyotish AI - Master of Astrology",
	description:
		"Discover the ancient wisdom of Vedic astrology through advanced AI. Get personalized insights, birth chart analysis, and cosmic guidance.",
	keywords:
		"vedic astrology, jyotish, birth chart, horoscope, AI astrology, planetary positions, cosmic guidance",
	authors: [{ name: "Jyotish AI" }],
	viewport: "width=device-width, initial-scale=1",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className="dark"
			suppressHydrationWarning>
			<body className="min-h-screen bg-background text-foreground antialiased font-sans">
				<div className="relative flex min-h-screen flex-col">
					<div className="flex-1">{children}</div>
				</div>
			</body>
		</html>
	);
}
