"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Paperclip, Mic, StopCircle, Moon, Sun, Sparkles } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";

interface ChatInputProps {
	onSubmit: (message: string) => void;
	isLoading?: boolean;
	placeholder?: string;
}

export default function ChatInput({
	onSubmit,
	isLoading = false,
	placeholder = "Share your cosmic thoughts with the oracle...",
}: ChatInputProps) {
	const [input, setInput] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
	}, [input]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;

		onSubmit(input);
		setInput("");

		// Reset textarea height
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			const form = e.currentTarget.form;
			if (form) {
				const formEvent = new Event("submit", { cancelable: true });
				handleSubmit(formEvent as unknown as React.FormEvent<HTMLFormElement>);
			}
		}
	};

	const handleVoiceRecord = () => {
		setIsRecording(!isRecording);
		// TODO: Implement voice recording functionality
	};

	return (
		<motion.div
			className="sticky bottom-0 z-40 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border-t border-purple-400/20"
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, delay: 0.2 }}>
			<div className="container mx-auto px-6 py-6 max-w-4xl">
				<form
					onSubmit={handleSubmit}
					className="relative"
					role="form"
					aria-label="Chat input form">
					<div className="flex items-center space-x-4">
						<button 
							type="button"
							className="p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 flex-shrink-0">
							<Moon className="w-5 h-5 text-purple-300" />
						</button>
						
						<div className="flex-1 relative">
							<textarea
								ref={textareaRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder={placeholder}
								disabled={isLoading}
								className="w-full bg-black/40 backdrop-blur-sm border border-purple-400/30 rounded-2xl px-5 py-4 text-purple-100 placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 resize-none transition-all duration-300 hover:bg-black/50 shadow-inner min-h-[44px] max-h-[120px]"
								rows={1}
								aria-label="Chat message input"
								aria-multiline="true"
								aria-describedby="message-help"
							/>
							<div className="absolute top-2 right-3">
								<Sparkles className="w-4 h-4 text-purple-400/50 animate-pulse" />
							</div>
							<div
								id="message-help"
								className="sr-only">
								Press Enter to send message, Shift + Enter for new line
							</div>
						</div>
						
						<button 
							type="button"
							className="p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50 flex-shrink-0">
							<Sun className="w-5 h-5 text-yellow-400" />
						</button>
						
						<AnimatePresence mode="wait">
							{input.trim() ? (
								<motion.div
									key="send"
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									transition={{ type: "spring", stiffness: 300 }}>
									<Button
										type="submit"
										disabled={isLoading}
										className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full transition-all duration-300 hover:scale-110 shadow-lg shadow-purple-500/50 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
										aria-label={
											isLoading ? "Sending message..." : "Send message"
										}>
										{isLoading ? (
											<LoadingSpinner
												size="sm"
												className="scale-75"
											/>
										) : (
											<Send className="w-5 h-5 text-white relative z-10" />
										)}
										<div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
									</Button>
								</motion.div>
							) : (
								<motion.div
									key="placeholder"
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									transition={{ type: "spring", stiffness: 300 }}
									className="h-11 w-11"
								/>
							)}
						</AnimatePresence>
					</div>
				</form>
			</div>
		</motion.div>
	);
}
