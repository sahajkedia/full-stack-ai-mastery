"use client";

import React, { useState } from "react";
import { Heart, Coffee, ChevronDown, Globe, IndianRupee } from "lucide-react";

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

	const sizeClasses = {
		sm: "px-4 py-2 text-xs",
		md: "px-5 py-2.5 text-sm",
		lg: "px-6 py-3 text-base",
	};

	const iconSizes = {
		sm: "w-4 h-4",
		md: "w-4 h-4",
		lg: "w-5 h-5",
	};

	const getVariantStyles = () => {
		switch (variant) {
			case "coffee":
				return "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white";
			case "heart":
				return "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white";
			case "upi":
				return "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white";
			case "cosmic":
			default:
				return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white";
		}
	};

	const getIcon = () => {
		switch (variant) {
			case "coffee":
				return <Coffee className={iconSizes[size]} />;
			case "heart":
				return <Heart className={iconSizes[size]} />;
			case "upi":
				return <IndianRupee className={iconSizes[size]} />;
			case "cosmic":
			default:
				return <span className="text-base">✨</span>;
		}
	};

	const handleKofiClick = () => {
		window.open(
			`https://ko-fi.com/${kofiUsername}`,
			"_blank",
			"noopener,noreferrer"
		);
		setIsDropdownOpen(false);
	};

	const handleUpiClick = () => {
		// Generate UPI payment URL
		const upiUrl = `upi://pay?pa=${upiId}&pn=Jyotish AI&mc=0000&tid=1234567890&tr=donation&tn=Support Jyotish AI&am=&cu=INR`;

		// Try to open UPI app, fallback to showing UPI ID
		try {
			window.open(upiUrl, "_self");
		} catch {
			// Fallback: copy UPI ID to clipboard and show alert
			navigator.clipboard
				.writeText(upiId)
				.then(() => {
					alert(
						`UPI ID copied to clipboard: ${upiId}\n\nYou can use any UPI app (PhonePe, Google Pay, Paytm) to send support!`
					);
				})
				.catch(() => {
					alert(
						`UPI ID: ${upiId}\n\nPlease copy this and use any UPI app to send support!`
					);
				});
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
					hover:scale-105
					hover:shadow-lg
					flex
					items-center
					space-x-2
					shadow-md
					backdrop-blur-sm
					border
					border-white/20
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
				onClick={() => setIsDropdownOpen(!isDropdownOpen)}
				className={`
					${getVariantStyles()}
					${sizeClasses[size]}
					rounded-full
					font-medium
					transition-all
					duration-300
					hover:scale-105
					hover:shadow-lg
					flex
					items-center
					space-x-2
					shadow-md
					backdrop-blur-sm
					border
					border-white/20
					${className}
				`}
				title="Support the cosmic journey ✨"
				aria-label="Support this project">
				{getIcon()}
				<span>Support</span>
				<ChevronDown
					className={`w-3 h-3 transition-transform duration-300 ${
						isDropdownOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isDropdownOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsDropdownOpen(false)}
					/>

					{/* Clean Dropdown */}
					<div className="absolute top-full right-0 mt-2 w-52 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden">
						{/* Ko-fi Option */}
						<button
							onClick={handleKofiClick}
							className="w-full px-4 py-3 text-left text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 border-b border-white/10">
							<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
								<Globe className="w-4 h-4 text-white" />
							</div>
							<div className="flex-1">
								<div className="font-medium text-sm">Ko-fi</div>
								<div className="text-xs text-white/80">Global payments</div>
							</div>
						</button>

						{/* UPI Option */}
						<button
							onClick={handleUpiClick}
							className="w-full px-4 py-3 text-left text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-3">
							<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
								<IndianRupee className="w-4 h-4 text-white" />
							</div>
							<div className="flex-1">
								<div className="font-medium text-sm">UPI</div>
								<div className="text-xs text-white/80">India • Instant</div>
							</div>
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default SupportButton;
