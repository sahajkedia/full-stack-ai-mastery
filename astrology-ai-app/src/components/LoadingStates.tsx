"use client";

import React from "react";
import { Loader2, Stars, Sparkles, Moon, Sun } from "lucide-react";

export const ChartSkeleton: React.FC = () => (
	<div className="animate-pulse">
		<div className="bg-white/10 rounded-lg p-4 mb-4">
			<div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
			<div className="h-3 bg-white/20 rounded w-1/2"></div>
		</div>
		<div className="grid grid-cols-3 gap-4">
			{[...Array(9)].map((_, i) => (
				<div
					key={i}
					className="bg-white/10 rounded-lg p-3">
					<div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2"></div>
					<div className="h-3 bg-white/20 rounded w-full mb-1"></div>
					<div className="h-2 bg-white/20 rounded w-2/3 mx-auto"></div>
				</div>
			))}
		</div>
	</div>
);

export const FormSkeleton: React.FC = () => (
	<div className="animate-pulse space-y-6">
		<div>
			<div className="h-4 bg-white/20 rounded w-1/4 mb-2"></div>
			<div className="h-10 bg-white/20 rounded"></div>
		</div>
		<div>
			<div className="h-4 bg-white/20 rounded w-1/4 mb-2"></div>
			<div className="grid grid-cols-2 gap-3">
				<div className="h-10 bg-white/20 rounded"></div>
				<div className="h-10 bg-white/20 rounded"></div>
			</div>
		</div>
		<div>
			<div className="h-4 bg-white/20 rounded w-1/4 mb-2"></div>
			<div className="grid grid-cols-3 gap-3">
				<div className="h-10 bg-white/20 rounded"></div>
				<div className="h-10 bg-white/20 rounded"></div>
				<div className="h-10 bg-white/20 rounded"></div>
			</div>
		</div>
	</div>
);

interface LoadingSpinnerProps {
	message?: string;
	size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
	message = "Loading...",
	size = "md",
}) => {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-6 h-6",
		lg: "w-8 h-8",
	};

	return (
		<div className="flex items-center justify-center space-x-2">
			<Loader2
				className={`${sizeClasses[size]} animate-spin text-purple-400`}
			/>
			<span className="text-white/80 text-sm">{message}</span>
		</div>
	);
};

interface StreamingStatusProps {
	message: string;
	step?: number;
	totalSteps?: number;
}

export const StreamingStatus: React.FC<StreamingStatusProps> = ({
	message,
	step,
	totalSteps,
}) => {
	const getIcon = () => {
		if (message.includes("Processing"))
			return <Stars className="w-5 h-5 animate-pulse" />;
		if (message.includes("chart"))
			return <Moon className="w-5 h-5 animate-spin" />;
		if (message.includes("insights"))
			return <Sun className="w-5 h-5 animate-bounce" />;
		return <Sparkles className="w-5 h-5 animate-pulse" />;
	};

	return (
		<div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4 mb-4">
			<div className="flex items-center space-x-3">
				<div className="text-purple-300">{getIcon()}</div>
				<div className="flex-1">
					<p className="text-white font-medium text-sm">{message}</p>
					{step && totalSteps && (
						<div className="mt-2">
							<div className="flex justify-between text-xs text-white/60 mb-1">
								<span>
									Step {step} of {totalSteps}
								</span>
								<span>{Math.round((step / totalSteps) * 100)}%</span>
							</div>
							<div className="w-full bg-white/20 rounded-full h-1.5">
								<div
									className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all duration-500"
									style={{ width: `${(step / totalSteps) * 100}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export const MessageSkeleton: React.FC = () => (
	<div className="animate-pulse">
		<div className="flex space-x-3 mb-4">
			<div className="w-8 h-8 bg-white/20 rounded-full flex-shrink-0"></div>
			<div className="flex-1 space-y-2">
				<div className="h-4 bg-white/20 rounded w-3/4"></div>
				<div className="h-4 bg-white/20 rounded w-1/2"></div>
				<div className="h-4 bg-white/20 rounded w-5/6"></div>
			</div>
		</div>
	</div>
);

interface TypingIndicatorProps {
	avatar?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
	avatar = "🔮",
}) => (
	<div className="flex items-center space-x-3 p-4 bg-white/5 rounded-2xl">
		<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
			{avatar}
		</div>
		<div className="flex space-x-1">
			<div
				className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
				style={{ animationDelay: "0ms" }}></div>
			<div
				className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
				style={{ animationDelay: "150ms" }}></div>
			<div
				className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
				style={{ animationDelay: "300ms" }}></div>
		</div>
	</div>
);

export const EmptyState: React.FC<{
	title: string;
	description: string;
	action?: React.ReactNode;
}> = ({ title, description, action }) => (
	<div className="text-center py-12">
		<div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
			<Stars className="w-8 h-8 text-purple-300" />
		</div>
		<h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
		<p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">{description}</p>
		{action}
	</div>
);
