"use client";

import { motion } from "framer-motion";
import { User, Bot, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import LoadingSpinner from "./LoadingSpinner";

interface ChatMessageProps {
	role: "user" | "assistant";
	content: string;
	isLoading?: boolean;
	timestamp?: Date;
}

export default function ChatMessage({
	role,
	content,
	isLoading,
	timestamp = new Date(),
}: ChatMessageProps) {
	const isUser = role === "user";

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{
				duration: 0.3,
				type: "spring",
				stiffness: 200,
				damping: 20,
			}}
			className={cn(
				"flex w-full gap-3 px-4 py-6",
				isUser ? "justify-end" : "justify-start"
			)}>
			{!isUser && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.1 }}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg ring-2 ring-purple-500/50 ring-offset-2 ring-offset-background">
					<Bot className="h-5 w-5 text-white" />
				</motion.div>
			)}

			<div
				className={cn(
					"group relative max-w-2xl rounded-2xl px-4 py-3 shadow-lg transition-all duration-300",
					isUser
						? "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40"
						: "bg-card border border-border text-card-foreground hover:shadow-xl hover:bg-card/80"
				)}
				role="article"
				aria-label={`${role} message`}>
				{!isUser && (
					<div className="absolute -top-1 -right-1">
						<Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
					</div>
				)}

				<div className="relative space-y-2">
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
								Consulting the stars...
							</motion.span>
						</div>
					) : (
						<>
							<p className="text-sm leading-relaxed whitespace-pre-wrap">
								{content}
							</p>
							<div
								className={cn(
									"text-[10px] opacity-60 select-none",
									isUser ? "text-right" : "text-left"
								)}>
								{/* Use UTC to ensure consistent server/client rendering */}
								{new Date(timestamp).toLocaleTimeString("en-US", {
									hour: "2-digit",
									minute: "2-digit",
									hour12: true,
									timeZone: "UTC",
								})}
							</div>
						</>
					)}
				</div>

				{/* Message tail */}
				<div
					className={cn(
						"absolute top-4 h-3 w-3 rotate-45 transition-all duration-300",
						isUser
							? "-right-1.5 bg-gradient-to-br from-purple-500 to-violet-600"
							: "-left-1.5 bg-card border-l border-t border-border group-hover:bg-card/80"
					)}
					aria-hidden="true"
				/>
			</div>

			{isUser && (
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.1 }}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg ring-2 ring-purple-500/50 ring-offset-2 ring-offset-background">
					<User className="h-5 w-5 text-white" />
				</motion.div>
			)}
		</motion.div>
	);
}
