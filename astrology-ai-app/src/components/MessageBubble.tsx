"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface MessageBubbleProps {
	children: React.ReactNode;
	isUser?: boolean;
	className?: string;
	onClick?: () => void;
}

export default function MessageBubble({
	children,
	isUser = false,
	className,
	onClick,
}: MessageBubbleProps) {
	return (
		<motion.div
			className={cn(
				"relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 cursor-pointer",
				isUser
					? "bg-gradient-to-br from-purple-500 to-violet-600 text-white ml-auto hover:shadow-lg"
					: "bg-card border border-border/50 text-card-foreground hover:shadow-lg hover:bg-card/80",
				className
			)}
			whileHover={{ scale: 1.01 }}
			whileTap={{ scale: 0.99 }}
			onClick={onClick}
			role="button"
			tabIndex={onClick ? 0 : undefined}
			onKeyDown={
				onClick
					? (e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onClick();
							}
					  }
					: undefined
			}>
			{children}
		</motion.div>
	);
}
