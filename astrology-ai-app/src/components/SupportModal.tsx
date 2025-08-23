"use client";

import React from "react";
import {
	X,
	Heart,
	Sparkles,
	Star,
	Coffee,
	Globe,
	IndianRupee,
	Zap,
} from "lucide-react";

interface SupportModalProps {
	isOpen: boolean;
	onClose: () => void;
	kofiUsername?: string;
	upiId?: string;
}

const SupportModal: React.FC<SupportModalProps> = ({
	isOpen,
	onClose,
	kofiUsername = "buildersahaj",
	upiId = "9108342605@ybl",
}) => {
	if (!isOpen) return null;

	const handleKofiClick = () => {
		window.open(
			`https://ko-fi.com/${kofiUsername}`,
			"_blank",
			"noopener,noreferrer"
		);
	};

	const handleUpiClick = async () => {
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
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="relative w-full max-w-md bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
					{/* Close button */}
					<button
						onClick={onClose}
						className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
						<X className="w-5 h-5" />
					</button>

					{/* Cosmic Header */}
					<div className="relative p-6 text-center bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 border-b border-white/20">
						{/* Animated background elements */}
						<div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>
						<div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
						<div className="absolute -bottom-10 -left-10 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

						{/* Floating cosmic elements */}
						<div className="absolute inset-0 overflow-hidden pointer-events-none">
							<Star className="absolute top-8 left-8 w-4 h-4 text-yellow-400/30 animate-pulse" />
							<Star className="absolute top-12 right-12 w-3 h-3 text-cyan-400/40 animate-pulse delay-1000" />
							<Star className="absolute bottom-12 left-12 w-5 h-5 text-purple-400/30 animate-pulse delay-500" />
							<Star className="absolute bottom-8 right-8 w-3 h-3 text-pink-400/40 animate-pulse delay-1500" />
							<Sparkles className="absolute top-6 right-6 w-6 h-6 text-white/20 floating-stars" />
							<Sparkles className="absolute bottom-6 left-6 w-4 h-4 text-white/30 floating-stars delay-1000" />
						</div>

						<div className="relative z-10">
							<div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-3 animate-pulse">
								✨
							</div>
							<h3 className="text-white font-bold text-xl mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
								Enjoying Your Cosmic Journey?
							</h3>
							<p className="text-white/80 text-sm leading-relaxed">
								If Jyotish AI has been helpful in your spiritual exploration,
								consider supporting our mission to bring ancient Vedic wisdom to
								the modern world.
							</p>
						</div>
					</div>

					{/* Content */}
					<div className="p-6 space-y-4">
						{/* Support message */}
						<div className="text-center space-y-3">
							<div className="flex items-center justify-center space-x-2 text-white/90">
								<Heart className="w-5 h-5 text-pink-400" />
								<span className="text-sm font-medium">
									Your support fuels the cosmos
								</span>
								<Heart className="w-5 h-5 text-pink-400" />
							</div>
							<p className="text-white/70 text-sm leading-relaxed">
								Every contribution helps us maintain and improve Jyotish AI,
								ensuring accurate astrological insights for seekers worldwide.
							</p>
						</div>

						{/* Support buttons */}
						<div className="space-y-3">
							{/* UPI Option */}
							<button
								onClick={handleUpiClick}
								className="group relative w-full p-4 text-left text-white bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500 hover:to-green-500 transition-all duration-300 flex items-center space-x-4 rounded-2xl shadow-lg border border-white/20 active:scale-[0.98] overflow-hidden">
								{/* Cosmic background effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

								<div className="relative z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
									<IndianRupee className="w-6 h-6 text-white" />
								</div>
								<div className="relative z-10 flex-1">
									<div className="font-bold text-base mb-1">UPI Payment</div>
									<div className="text-xs text-white/90 flex items-center space-x-2">
										<Zap className="w-3 h-3" />
										<span>India • Instant • No Fees</span>
									</div>
								</div>
							</button>

							{/* Ko-fi Option */}
							<button
								onClick={handleKofiClick}
								className="group relative w-full p-4 text-left text-white bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 flex items-center space-x-4 rounded-2xl shadow-lg border border-white/20 active:scale-[0.98] overflow-hidden">
								{/* Cosmic background effect */}
								<div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

								<div className="relative z-10 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
									<Globe className="w-6 h-6 text-white" />
								</div>
								<div className="relative z-10 flex-1">
									<div className="font-bold text-base mb-1">Ko-fi</div>
									<div className="text-xs text-white/90 flex items-center space-x-2">
										<Coffee className="w-3 h-3" />
										<span>Global • Digital • Flexible</span>
									</div>
								</div>
							</button>
						</div>

						{/* Optional: Continue without supporting */}
						<div className="text-center">
							<button
								onClick={onClose}
								className="text-white/60 hover:text-white/80 text-sm transition-colors duration-300 underline underline-offset-2">
								Continue exploring the cosmos
							</button>
						</div>
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
		</>
	);
};

export default SupportModal;
