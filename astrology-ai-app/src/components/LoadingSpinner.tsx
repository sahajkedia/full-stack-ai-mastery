"use client";

import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

export default function LoadingSpinner({
	size = "md",
	className,
}: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-8 h-8",
		lg: "w-12 h-12",
	};

	return (
		<div
			className={cn(
				"relative flex items-center justify-center",
				sizeClasses[size],
				className
			)}>
			{/* Outer ring */}
			<motion.div
				className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500"
				animate={{ rotate: 360 }}
				transition={{
					duration: 1,
					repeat: Infinity,
					ease: "linear",
				}}
			/>

			{/* Middle ring */}
			<motion.div
				className="absolute inset-[2px] rounded-full border-2 border-transparent border-t-violet-500"
				animate={{ rotate: -360 }}
				transition={{
					duration: 1.5,
					repeat: Infinity,
					ease: "linear",
				}}
			/>

			{/* Inner ring */}
			<motion.div
				className="absolute inset-[4px] rounded-full border-2 border-transparent border-t-blue-500"
				animate={{ rotate: 360 }}
				transition={{
					duration: 2,
					repeat: Infinity,
					ease: "linear",
				}}
			/>

			{/* Center dot */}
			<motion.div
				className="absolute inset-[6px] rounded-full bg-gradient-to-br from-purple-500 to-violet-500"
				animate={{ scale: [0.8, 1.2, 0.8] }}
				transition={{
					duration: 2,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Glow effect */}
			<div className="absolute inset-0 rounded-full bg-purple-500/20 blur-sm" />
		</div>
	);
}
