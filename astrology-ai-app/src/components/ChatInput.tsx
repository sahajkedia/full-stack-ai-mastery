"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Smile, Paperclip } from "lucide-react";
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
	placeholder = "Ask the cosmos about your destiny...",
}: ChatInputProps) {
	const [input, setInput] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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

	return (
		<motion.div
			className="sticky bottom-6 mt-8"
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, delay: 0.2 }}>
			<div className="mx-auto max-w-4xl">
				<form
					onSubmit={handleSubmit}
					className="relative"
					role="form"
					aria-label="Chat input form">
					<div className="relative">
						<motion.div
							className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-2xl blur-xl"
							animate={{
								scale: [1, 1.02, 1],
								opacity: [0.3, 0.2, 0.3],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
						<div className="relative bg-background/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
							<div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-purple-600/5" />
							<div className="flex items-end p-4 gap-4">
								<div className="flex-1 relative">
									<Textarea
										ref={textareaRef}
										value={input}
										onChange={(e) => setInput(e.target.value)}
										onKeyDown={handleKeyDown}
										placeholder={placeholder}
										disabled={isLoading}
										className={cn(
											"min-h-[56px] w-full resize-none bg-background/20 border-white/10 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl pr-24 text-base py-4",
											"scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20",
											"placeholder:text-white/40"
										)}
										rows={1}
										aria-label="Chat message input"
										aria-multiline="true"
										aria-describedby="message-help"
									/>
									<div
										id="message-help"
										className="sr-only">
										Press Enter to send message, Shift + Enter for new line
									</div>
									<div className="absolute right-3 bottom-3 flex items-center gap-2">
										<motion.div
											initial={false}
											animate={{
												scale: input.length > 0 ? 1 : 0,
												opacity: input.length > 0 ? 1 : 0,
											}}
											className="text-[10px] text-white/40 bg-white/5 px-2 py-1 rounded-full">
											{input.length} chars
										</motion.div>
										<div className="flex gap-1">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-white/40 hover:text-white/60 hover:bg-white/5"
												disabled={isLoading}
												aria-label="Add emoji">
												<Smile className="h-5 w-5" />
												<span className="sr-only">Add emoji</span>
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-white/40 hover:text-white/60 hover:bg-white/5"
												disabled={isLoading}
												aria-label="Attach file">
												<Paperclip className="h-5 w-5" />
												<span className="sr-only">Attach file</span>
											</Button>
										</div>
									</div>
								</div>

								<Button
									type="submit"
									disabled={isLoading || !input.trim()}
									variant="cosmic"
									size="lg"
									className={cn(
										"h-[56px] gap-2 relative group transition-all duration-300",
										input.trim()
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-2 pointer-events-none"
									)}
									aria-label={
										isLoading ? "Sending message..." : "Send message"
									}>
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
										animate={{
											scale: [0.9, 1.1, 0.9],
										}}
										transition={{
											duration: 4,
											repeat: Infinity,
											ease: "easeInOut",
										}}
									/>
									{isLoading ? (
										<LoadingSpinner
											size="sm"
											className="scale-75"
										/>
									) : (
										<Send
											className="h-5 w-5"
											aria-hidden="true"
										/>
									)}
									<span>{isLoading ? "Consulting..." : "Send"}</span>
								</Button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</motion.div>
	);
}
