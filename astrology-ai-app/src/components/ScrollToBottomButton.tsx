"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

interface ScrollToBottomButtonProps {
	onClick: () => void;
	show: boolean;
}

export default function ScrollToBottomButton({
	onClick,
	show,
}: ScrollToBottomButtonProps) {
	return (
		<AnimatePresence>
			{!show && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
					className="absolute bottom-24 right-8 z-10">
					<Button
						variant="secondary"
						size="icon"
						onClick={onClick}
						className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl border border-border/50"
						aria-label="Scroll to bottom">
						<ChevronDown className="h-5 w-5" />
					</Button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
