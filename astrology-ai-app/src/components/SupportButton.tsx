"use client";

import React, { useState, useEffect } from "react";
import {
	Heart,
	Coffee,
	ChevronDown,
	Globe,
	IndianRupee,
	Star,
	Sparkles,
	Zap,
} from "lucide-react";

interface SupportButtonProps {
	kofiUsername?: string;
	upiId?: string;
	className?: string;
	size?: "sm" | "md" | "lg";
	variant?: "coffee" | "heart" | "cosmic" | "upi";
	showDropdown?: boolean;
}

const SupportButton: React.FC<SupportButtonProps> = ({
	kofiUsername = "buildersahaj",
	upiId = "9108342605@ybl",
	className = "",
	size = "md",
	variant = "cosmic",
	showDropdown = true,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Dynamic mobile detection with resize listener
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Haptic feedback simulation for mobile
	const triggerHapticFeedback = () => {
		if (isMobile && "vibrate" in navigator) {
			navigator.vibrate(50); // Light haptic feedback
		}
	};

	const sizeClasses = {
		sm: isMobile
			? "px-6 py-3.5 text-sm font-semibold min-h-[44px] touch-manipulation"
			: "px-4 py-2 text-xs",
		md: "px-5 py-2.5 text-sm",
		lg: "px-6 py-3 text-base",
	};

	const iconSizes = {
		sm: "w-4 h-4",
		md: "w-4 h-4",
		lg: "w-5 h-5",
	};

	const getVariantStyles = () => {
		const baseStyles = isMobile
			? "shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-white/50 hover:scale-105"
			: "shadow-md hover:shadow-lg border border-white/20 hover:border-white/30 hover:scale-105";

		switch (variant) {
			case "coffee":
				return `bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white ${baseStyles}`;
			case "heart":
				return `bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white ${baseStyles}`;
			case "upi":
				return `bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white ${baseStyles}`;
			case "cosmic":
			default:
				return `bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white ${baseStyles}`;
		}
	};

	const getIcon = () => {
		const iconClass = isMobile && size === "sm" ? "w-5 h-5" : iconSizes[size];
		switch (variant) {
			case "coffee":
				return <Coffee className={iconClass} />;
			case "heart":
				return <Heart className={iconClass} />;
			case "upi":
				return <IndianRupee className={iconClass} />;
			case "cosmic":
			default:
				return <span className={isMobile ? "text-lg" : "text-base"}>✨</span>;
		}
	};

	const handleKofiClick = () => {
		triggerHapticFeedback();
		window.open(
			`https://ko-fi.com/${kofiUsername}`,
			"_blank",
			"noopener,noreferrer"
		);
		setIsDropdownOpen(false);
	};

	const handleUpiClick = async () => {
		triggerHapticFeedback();
		// Generate UPI payment URL
		const upiUrl = `upi://pay?pa=${upiId}&pn=Jyotish AI&mc=0000&tid=1234567890&tr=donation&tn=Support Jyotish AI&am=&cu=INR`;

		// Try to open UPI app, fallback to showing UPI ID
		try {
			window.open(upiUrl, "_self");
		} catch {
			// Fallback: copy UPI ID to clipboard and show alert
			try {
				await navigator.clipboard.writeText(upiId);
				alert(
					`✨ UPI ID copied to clipboard: ${upiId}\n\nYou can use any UPI app (PhonePe, Google Pay, Paytm) to send support!`
				);
			} catch {
				alert(
					`✨ UPI ID: ${upiId}\n\nPlease copy this and use any UPI app to send support!`
				);
			}
		}
		setIsDropdownOpen(false);
	};

	if (!showDropdown) {
		return (
			<button
				onClick={handleKofiClick}
				className={`
					${getVariantStyles()}
					${sizeClasses[size]}
					rounded-full
					font-medium
					transition-all
					duration-300
					flex
					items-center
					space-x-2
					backdrop-blur-sm
					${className}
				`}
				title="Support the cosmic journey ✨"
				aria-label="Support this project">
				{getIcon()}
				<span>Support</span>
			</button>
		);
	}

	return (
		<div className="relative">
			<button
				onClick={() => {
					triggerHapticFeedback();
					setIsDropdownOpen(!isDropdownOpen);
				}}
				className={`
					${getVariantStyles()}
					${sizeClasses[size]}
					rounded-full
					font-medium
					transition-all
					duration-300
					flex
					items-center
					space-x-2
					backdrop-blur-sm
					hover:shadow-lg
					hover:shadow-purple-500/25
					relative
					overflow-hidden
					group
					${className}
				`}
				title="Support the cosmic journey ✨"
				aria-label="Support this project">
				{/* Subtle cosmic glow effect */}
				<div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

				{/* Animated sparkle effect */}
				<div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>

				<div className="relative z-10 flex items-center space-x-2">
					<div className="relative">
						{getIcon()}
						{/* Subtle sparkle on icon */}
						<div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
					</div>
					<span>Support</span>
					<ChevronDown
						className={`w-3 h-3 transition-transform duration-300 ${
							isDropdownOpen ? "rotate-180" : ""
						}`}
					/>
				</div>
			</button>

			{isDropdownOpen && (
				<>
					{/* Enhanced Cosmic Backdrop */}
					<div
						className="fixed inset-0 z-40 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-indigo-900/30 backdrop-blur-sm"
						onClick={() => setIsDropdownOpen(false)}
					/>

					{/* Cosmic Mobile Modal */}
					{isMobile ? (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
							{/* Enhanced backdrop with cosmic effects */}
							<div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 backdrop-blur-2xl"></div>

							{/* Floating cosmic elements */}
							<div className="absolute inset-0 overflow-hidden pointer-events-none">
								<Star className="absolute top-20 left-20 w-4 h-4 text-yellow-400/30 animate-pulse" />
								<Star className="absolute top-32 right-16 w-3 h-3 text-cyan-400/40 animate-pulse delay-1000" />
								<Star className="absolute bottom-32 left-16 w-5 h-5 text-purple-400/30 animate-pulse delay-500" />
								<Star className="absolute bottom-20 right-20 w-3 h-3 text-pink-400/40 animate-pulse delay-1500" />
								<Sparkles className="absolute top-16 right-8 w-6 h-6 text-white/20 floating-stars" />
								<Sparkles className="absolute bottom-16 left-8 w-4 h-4 text-white/30 floating-stars delay-1000" />
							</div>

							<div className="relative w-full max-w-sm bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
								{/* Cosmic Header with Gradient */}
								<div className="relative p-6 text-center bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 border-b border-white/20">
									{/* Animated background elements */}
									<div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>
									<div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
									<div className="absolute -bottom-10 -left-10 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

									<div className="relative z-10">
										<div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-3 animate-pulse">
											✨
										</div>
										<h3 className="text-white font-bold text-xl mb-1 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
											Support the Cosmic Journey
										</h3>
										<p className="text-white/80 text-sm">
											Fuel the stars with your energy
										</p>
									</div>
								</div>

								{/* Payment Options with Enhanced Styling */}
								<div className="p-4 space-y-3">
									{/* UPI Option - Enhanced */}
									<button
										onClick={handleUpiClick}
										className="group relative w-full p-5 text-left text-white bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500 hover:to-green-500 transition-all duration-300 flex items-center space-x-4 rounded-2xl shadow-lg border border-white/20 active:scale-[0.98] overflow-hidden touch-manipulation min-h-[60px]">
										{/* Cosmic background effect */}
										<div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

										<div className="relative z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
											<IndianRupee className="w-6 h-6 text-white" />
										</div>
										<div className="relative z-10 flex-1">
											<div className="font-bold text-base mb-1">
												UPI Payment
											</div>
											<div className="text-xs text-white/90 flex items-center space-x-2">
												<Zap className="w-3 h-3" />
												<span>India • Instant • No Fees</span>
											</div>
										</div>
									</button>

									{/* Ko-fi Option - Enhanced */}
									<button
										onClick={handleKofiClick}
										className="group relative w-full p-5 text-left text-white bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center space-x-4 rounded-2xl shadow-lg border border-white/20 active:scale-[0.98] overflow-hidden touch-manipulation min-h-[60px]">
										{/* Cosmic background effect */}
										<div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

										<div className="relative z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
											<Globe className="w-6 h-6 text-white" />
										</div>
										<div className="relative z-10 flex-1">
											<div className="font-bold text-base mb-1">Ko-fi</div>
											<div className="text-xs text-white/90 flex items-center space-x-2">
												<Star className="w-3 h-3" />
												<span>Global • Digital • Flexible</span>
											</div>
										</div>
									</button>
								</div>

								{/* Enhanced Footer */}
								<div className="relative p-4 text-center bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-t border-white/20">
									<div className="flex items-center justify-center space-x-2 text-white/70 text-xs">
										<Sparkles className="w-3 h-3" />
										<span>Secure • Trusted • Cosmic</span>
										<Sparkles className="w-3 h-3" />
									</div>
								</div>
							</div>
						</div>
					) : (
						// Desktop: Enhanced Cosmic Dropdown
						<div className="absolute top-full right-0 mt-3 w-64 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
							{/* Cosmic Header */}
							<div className="px-4 py-3 text-center bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/20">
								<div className="flex items-center justify-center space-x-2">
									<Sparkles className="w-4 h-4 text-purple-300" />
									<span className="text-white font-semibold text-sm">
										Support the Stars
									</span>
									<Sparkles className="w-4 h-4 text-pink-300" />
								</div>
							</div>

							{/* Enhanced Ko-fi Option */}
							<button
								onClick={handleKofiClick}
								className="group w-full px-4 py-4 text-left text-white bg-gradient-to-r from-blue-600/60 to-purple-600/60 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center space-x-3 border-b border-white/10 relative overflow-hidden">
								{/* Cosmic hover effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

								<div className="relative z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
									<Globe className="w-5 h-5 text-white" />
								</div>
								<div className="relative z-10 flex-1">
									<div className="font-semibold text-sm mb-1">Ko-fi</div>
									<div className="text-xs text-white/80 flex items-center space-x-1">
										<Star className="w-3 h-3" />
										<span>Global • Digital • Flexible</span>
									</div>
								</div>
							</button>

							{/* Enhanced UPI Option */}
							<button
								onClick={handleUpiClick}
								className="group w-full px-4 py-4 text-left text-white bg-gradient-to-r from-emerald-600/60 to-green-600/60 hover:from-emerald-500 hover:to-green-500 transition-all duration-300 flex items-center space-x-3 relative overflow-hidden">
								{/* Cosmic hover effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

								<div className="relative z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
									<IndianRupee className="w-5 h-5 text-white" />
								</div>
								<div className="relative z-10 flex-1">
									<div className="font-semibold text-sm mb-1">UPI Payment</div>
									<div className="text-xs text-white/80 flex items-center space-x-1">
										<Zap className="w-3 h-3" />
										<span>India • Instant • No Fees</span>
									</div>
								</div>
							</button>

							{/* Cosmic Footer */}
							<div className="px-4 py-3 text-center bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-t border-white/20">
								<div className="flex items-center justify-center space-x-2 text-white/60 text-xs">
									<Star className="w-3 h-3 animate-pulse" />
									<span>Your support fuels the cosmos</span>
									<Star className="w-3 h-3 animate-pulse delay-1000" />
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default SupportButton;
