"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

interface ChatContainerProps {
	children: React.ReactNode;
	className?: string;
	onScrollToBottom?: () => void;
	showScrollButton?: boolean;
}

export default function ChatContainer({
	children,
	className,
	onScrollToBottom,
	showScrollButton = false,
}: ChatContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom when new messages are added
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const scrollToBottom = () => {
			container.scrollTo({
				top: container.scrollHeight,
				behavior: "smooth",
			});
		};

		// Use ResizeObserver to detect when content changes
		const resizeObserver = new ResizeObserver(() => {
			scrollToBottom();
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();
		};
	}, [children]);

	return (
		<div className={cn("relative flex flex-col h-full", className)}>
			{/* Messages Container */}
			<div
				ref={containerRef}
				className="flex-1 overflow-y-auto scroll-smooth px-4 py-6 space-y-2 chat-scrollbar">
				<AnimatePresence mode="popLayout">{children}</AnimatePresence>
			</div>

			{/* Scroll to bottom button */}
			<AnimatePresence>
				{showScrollButton && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="absolute bottom-4 right-4 z-10">
						<Button
							onClick={onScrollToBottom}
							variant="secondary"
							size="icon"
							className="h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/90"
							aria-label="Scroll to bottom">
							<ChevronDown className="h-5 w-5" />
						</Button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
