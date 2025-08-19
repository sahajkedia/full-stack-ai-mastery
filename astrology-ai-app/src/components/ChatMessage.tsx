"use client";

import { motion } from "framer-motion";
import { User, Bot, Sparkles, Clock, Star } from "lucide-react";
import { cn } from "../lib/utils";
import LoadingSpinner from "./LoadingSpinner";
import ChartCard from "./ChartCard";
import MessageBubble from "./MessageBubble";

type MessageContent =
	| { type: "text"; text: string }
	| { type: "chart"; data: Planet[] }
	| { type: "image"; url: string; alt: string };

interface Planet {
	name: string;
	degree: number;
	house: number;
	sign: string;
	symbol: string;
}

interface ChatMessageProps {
	role: "user" | "assistant";
	content: MessageContent | MessageContent[];
	isLoading?: boolean;
	timestamp?: Date;
}

const constellations = [
	"Orion",
	"Cassiopeia",
	"Draco",
	"Lyra",
	"Andromeda",
	"Perseus",
	"Cygnus",
];

export default function ChatMessage({
	role,
	content,
	isLoading,
	timestamp = new Date(),
}: ChatMessageProps) {
	const isUser = role === "user";
	// Use a consistent constellation based on timestamp to avoid hydration mismatch
	const constellationIndex =
		Math.floor(timestamp.getTime() / 1000) % constellations.length;
	const randomConstellation = constellations[constellationIndex];

	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		}).format(date);
	};

	const renderContent = (item: MessageContent, index: number) => {
		switch (item.type) {
			case "text":
				return (
					<div
						key={index}
						className="prose prose-sm max-w-none dark:prose-invert"
						style={
							{
								"--tw-prose-body": "hsl(var(--muted-foreground))",
								"--tw-prose-headings": "hsl(var(--foreground))",
								"--tw-prose-links": "hsl(var(--primary))",
								"--tw-prose-bold": "hsl(var(--foreground))",
								"--tw-prose-counters": "hsl(var(--muted-foreground))",
								"--tw-prose-bullets": "hsl(var(--muted-foreground))",
								"--tw-prose-hr": "hsl(var(--border))",
								"--tw-prose-quotes": "hsl(var(--foreground))",
								"--tw-prose-quote-borders": "hsl(var(--border))",
								"--tw-prose-captions": "hsl(var(--muted-foreground))",
								"--tw-prose-code": "hsl(var(--foreground))",
								"--tw-prose-pre-code": "hsl(var(--muted-foreground))",
								"--tw-prose-pre-bg": "hsl(var(--muted))",
								"--tw-prose-th-borders": "hsl(var(--border))",
								"--tw-prose-td-borders": "hsl(var(--border))",
							} as React.CSSProperties
						}>
						<div
							className="whitespace-pre-wrap leading-relaxed"
							dangerouslySetInnerHTML={{
								__html: item.text.replace(/\n/g, "<br />"),
							}}
						/>
					</div>
				);
			case "chart":
				return (
					<ChartCard
						key={index}
						data={item.data}
						className="my-4"
					/>
				);
			case "image":
				return (
					<div
						key={index}
						className="my-4">
						<img
							src={item.url}
							alt={item.alt}
							className="rounded-lg max-w-full h-auto shadow-lg border border-border/50"
							loading="lazy"
						/>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.3,
				type: "spring",
				stiffness: 300,
				damping: 30,
			}}
			className={cn(
				"group relative flex w-full gap-3 px-4 py-2",
				isUser ? "justify-end" : "justify-start"
			)}>
			{/* Avatar */}
			{!isUser && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
					className="relative flex-shrink-0">
					<div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
						<Sparkles className="w-5 h-5 text-white animate-pulse" />
					</div>
					<div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
				</motion.div>
			)}

			{/* Message Container */}
			<div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] lg:max-w-[70%]">
				{/* Message Bubble */}
				<motion.div
					className={cn(
						"relative rounded-2xl px-5 py-4 shadow-lg transform transition-all duration-300 hover:scale-105",
						isUser
							? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md shadow-purple-500/30"
							: "bg-black/60 backdrop-blur-sm text-purple-100 border border-purple-400/30 rounded-bl-md shadow-purple-900/50"
					)}
					whileHover={{ scale: 1.01 }}
					role="article"
					aria-label={`${role} message`}>
					{/* Loading State */}
					{isLoading ? (
						<div className="flex items-center gap-3">
							<LoadingSpinner size="sm" />
							<motion.span
								className="text-sm bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent"
								animate={{
									opacity: [0.7, 1, 0.7],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}>
								Channeling cosmic wisdom...
							</motion.span>
						</div>
					) : (
						<>
							{/* Content */}
							<div className="space-y-3">
								{Array.isArray(content)
									? content.map((item, index) => renderContent(item, index))
									: renderContent(content, 0)}
							</div>

							{/* Timestamp and Constellation */}
							<div
								className={cn(
									"flex items-center justify-between mt-2",
									isUser ? "justify-end" : "justify-start"
								)}>
								<p
									className={`text-xs ${
										isUser ? "text-purple-200" : "text-purple-300"
									}`}>
									{formatTime(timestamp)}
								</p>
								{!isUser && (
									<div className="flex items-center space-x-1">
										<Star className="w-3 h-3 text-yellow-400" />
										<span className="text-xs text-purple-300">
											{randomConstellation}
										</span>
									</div>
								)}
							</div>
						</>
					)}
				</motion.div>

				{/* Assistant Badge */}
				{!isUser && !isLoading && (
					<motion.div
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
						className="flex items-center gap-1 text-xs text-purple-300">
						<Sparkles className="h-3 w-3 text-purple-400" />
						<span>Cosmic Oracle</span>
					</motion.div>
				)}
			</div>

			{/* User Avatar */}
			{isUser && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg ring-1 ring-violet-500/20">
					<User className="h-5 w-5 text-white" />
				</motion.div>
			)}
		</motion.div>
	);
}
