import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Astrology AI - Personalized Astrological Insights",
	description:
		"Discover your cosmic path with AI-powered astrological readings and personalized birth chart analysis.",
	keywords:
		"astrology, AI, birth chart, horoscope, cosmic insights, personalized readings",
	authors: [{ name: "Astrology AI Team" }],
	viewport: "width=device-width, initial-scale=1",
	robots: "index, follow",
	openGraph: {
		title: "Astrology AI - Personalized Astrological Insights",
		description:
			"Discover your cosmic path with AI-powered astrological readings and personalized birth chart analysis.",
		type: "website",
		locale: "en_US",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<SessionProvider>{children}</SessionProvider>
			</body>
		</html>
	);
}
