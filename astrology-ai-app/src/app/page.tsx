"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, ArrowDown, Settings } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import VedicChart from "../components/VedicChart";
import BirthDetailsForm from "../components/BirthDetailsForm";
import SupportModal from "../components/SupportModal";

interface ChartData {
	planets: Array<{
		name: string;
		degree: number;
		house: number;
		sign: string;
		symbol: string;
	}>;
	ascendant: {
		degree: number;
		sign: string;
	};
}

interface Message {
	id: number;
	text: string;
	sender: "me" | "other";
	timestamp: Date;
	avatar?: string;
	chartData?: ChartData;
}

interface BirthDetails {
	name: string;
	gender: "male" | "female";
	day: string;
	month: string;
	year: string;
	hours: string;
	minutes: string;
	seconds: string;
	placeOfBirth: string;
}

const ChatInterface = () => {
	const [showForm, setShowForm] = useState(true);
	const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isTyping, setIsTyping] = useState(false);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [showSupportModal, setShowSupportModal] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleScroll = () => {
		if (chatContainerRef.current) {
			const { scrollTop, scrollHeight, clientHeight } =
				chatContainerRef.current;
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
			setShowScrollButton(!isNearBottom);
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const sendMessage = async () => {
		if (message.trim()) {
			const newMessage: Message = {
				id: messages.length + 1,
				text: message,
				sender: "me",
				timestamp: new Date(),
				avatar: "👤",
			};
			setMessages((prev) => [...prev, newMessage]);
			setMessage("");

			// Check if we should show support modal (after every 3 user messages)
			const userMessages = messages.filter((msg) => msg.sender === "me");
			if ((userMessages.length + 1) % 3 === 0) {
				// Show support modal after a short delay
				setTimeout(() => {
					setShowSupportModal(true);
				}, 1000);
			}

			// Simulate typing indicator
			setIsTyping(true);

			try {
				// Call the real AI API
				const response = await fetch("/api/chat", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						messages: [
							...messages.map((msg) => ({
								role: msg.sender === "me" ? "user" : "assistant",
								content: msg.text,
							})),
							{
								role: "user",
								content: message,
							},
						],
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to get response");
				}

				const data = await response.json();

				console.log("API Response:", data); // Debug log

				setIsTyping(false);
				const botResponse = {
					id: messages.length + 2,
					text: data.text || data.response,
					sender: "other" as const,
					timestamp: new Date(),
					avatar: "🔮",
					chartData: data.chartData || null,
				};
				console.log("Bot Response:", botResponse); // Debug log
				setMessages((prev) => [...prev, botResponse]);
			} catch (error) {
				console.error("Error calling AI API:", error);
				setIsTyping(false);
				const errorResponse: Message = {
					id: messages.length + 2,
					text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment. For accurate astrological guidance, please ensure you provide your complete birth details including date, time (in IST), and place of birth.",
					sender: "other",
					timestamp: new Date(),
					avatar: "🔮",
				};
				setMessages((prev) => [...prev, errorResponse]);
			}
		}
	};

	const handleFormSubmit = (details: BirthDetails) => {
		setBirthDetails(details);
		setShowForm(false);

		// Initialize chat with welcome message
		const welcomeMessage: Message = {
			id: 1,
			text: `Hey there! 🙏 I'm Jyotish AI, your cosmic guide to Vedic wisdom. Welcome, ${details.name}! I'm here to help you discover what the stars have in store for you!`,
			sender: "other",
			timestamp: new Date(),
			avatar: "🔮",
		};

		const detailsMessage: Message = {
			id: 2,
			text: `Perfect! I have your birth details:\n\n📅 **Date of Birth:** ${details.day}/${details.month}/${details.year}\n⏰ **Time of Birth:** ${details.hours}:${details.minutes}:${details.seconds}\n📍 **Place of Birth:** ${details.placeOfBirth}\n\nNow I can provide you with personalized astrological insights! What would you like to know about your cosmic blueprint? ✨`,
			sender: "other",
			timestamp: new Date(),
			avatar: "🔮",
		};

		setMessages([welcomeMessage, detailsMessage]);
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const formatTime = (date: Date) => {
		// Use a consistent 24-hour format to avoid hydration issues
		// Use UTC to ensure consistent rendering between server and client
		const hours = date.getUTCHours().toString().padStart(2, "0");
		const minutes = date.getUTCMinutes().toString().padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	return (
		<div className="h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-2 sm:p-4">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
				<div className="absolute top-1/3 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
				<div className="absolute bottom-1/4 left-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
			</div>

			{showForm ? (
				<div className="w-full max-w-md relative z-10">
					{/* Form Header */}
					<div className="text-center mb-8">
						<div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mx-auto mb-4">
							🔮
						</div>
						<h1 className="text-white font-bold text-3xl mb-2">Jyotish AI</h1>
						<p className="text-white/70 text-lg">
							Your Cosmic Guide to Vedic Wisdom
						</p>
					</div>

					<BirthDetailsForm
						onSubmit={handleFormSubmit}
						initialData={birthDetails}
					/>
				</div>
			) : (
				<div className="w-full max-w-4xl h-full max-h-[900px] relative">
					{/* Chat container with glassmorphism */}
					<div className="h-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
						{/* Header */}
						<div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4 sm:p-6 flex items-center justify-between">
							<div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
								<div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
									🔮
								</div>
								<div className="min-w-0 flex-1">
									<h1 className="text-white font-semibold text-lg sm:text-xl truncate">
										Jyotish AI
									</h1>
									<p className="text-white/70 text-xs sm:text-sm truncate">
										Your Cosmic Guide to Vedic Wisdom
									</p>
									{birthDetails && (
										<p className="text-white/50 text-xs truncate">
											{birthDetails.name} • {birthDetails.day}/
											{birthDetails.month}/{birthDetails.year}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
								<button
									onClick={() => setShowForm(true)}
									className="p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110"
									title="Edit Birth Details">
									<Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
								</button>
								{/* <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110">
									<Search className="w-5 h-5 text-white" />
								</button>
								<button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110">
									<Phone className="w-5 h-5 text-white" />
								</button>
								<button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110">
									<Video className="w-5 h-5 text-white" />
								</button>
								<button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110">
									<MoreVertical className="w-5 h-5 text-white" />
								</button> */}
							</div>
						</div>

						{/* Messages */}
						<div
							ref={chatContainerRef}
							onScroll={handleScroll}
							className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 chat-scrollbar">
							{messages.map((msg, index) => (
								<div
									key={msg.id}
									className={`flex ${
										msg.sender === "me" ? "justify-end" : "justify-start"
									} animate-fadeIn`}
									style={{
										animationDelay: `${index * 100}ms`,
									}}>
									<div
										className={`flex items-end space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-xs lg:max-w-md ${
											msg.sender === "me"
												? "flex-row-reverse space-x-reverse"
												: ""
										}`}>
										{msg.sender === "other" && (
											<div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
												{msg.avatar}
											</div>
										)}
										<div
											className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
												msg.sender === "me"
													? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
													: "bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-bl-md"
											}`}>
											{msg.sender === "me" ? (
												<p className="text-sm whitespace-pre-line">
													{msg.text}
												</p>
											) : (
												<div className="text-sm prose prose-invert max-w-none">
													<ReactMarkdown
														remarkPlugins={[remarkGfm]}
														components={{
															h1: ({ children }) => (
																<h1 className="text-lg font-bold mb-2 text-white">
																	{children}
																</h1>
															),
															h2: ({ children }) => (
																<h2 className="text-base font-semibold mb-2 text-white">
																	{children}
																</h2>
															),
															h3: ({ children }) => (
																<h3 className="text-sm font-semibold mb-1 text-white">
																	{children}
																</h3>
															),
															p: ({ children }) => (
																<p className="mb-2 text-white last:mb-0">
																	{children}
																</p>
															),
															strong: ({ children }) => (
																<strong className="font-semibold text-white">
																	{children}
																</strong>
															),
															em: ({ children }) => (
																<em className="italic text-white">
																	{children}
																</em>
															),
															ul: ({ children }) => (
																<ul className="list-disc list-inside mb-2 space-y-1 text-white">
																	{children}
																</ul>
															),
															ol: ({ children }) => (
																<ol className="list-decimal list-inside mb-2 space-y-1 text-white">
																	{children}
																</ol>
															),
															li: ({ children }) => (
																<li className="text-white">{children}</li>
															),
															code: ({ children }) => (
																<code className="bg-black/20 px-1 py-0.5 rounded text-xs font-mono text-white">
																	{children}
																</code>
															),
															blockquote: ({ children }) => (
																<blockquote className="border-l-2 border-purple-400 pl-3 italic text-white/90 mb-2">
																	{children}
																</blockquote>
															),
														}}>
														{msg.text}
													</ReactMarkdown>

													{/* Display birth chart if available */}
													{msg.chartData ? (
														<div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/20">
															<h3 className="text-sm font-semibold text-white mb-3">
																Your Birth Chart
															</h3>
															{/* Debug info */}
															<div className="text-xs text-white/60 mb-2">
																Chart data received:{" "}
																{msg.chartData.planets?.length || 0} planets
															</div>
															{msg.chartData.planets &&
															msg.chartData.planets.length > 0 ? (
																<VedicChart
																	planets={msg.chartData.planets.map((p) => ({
																		name: p.name,
																		degree: p.degree,
																		house: p.house,
																		sign: p.sign,
																		symbol: p.symbol,
																	}))}
																	title="Your Cosmic Blueprint"
																/>
															) : (
																<div className="text-white/60 text-sm">
																	Chart data is being calculated...
																</div>
															)}
														</div>
													) : null}
												</div>
											)}
											<p
												className={`text-xs mt-1 ${
													msg.sender === "me"
														? "text-white/80"
														: "text-white/60"
												}`}>
												{formatTime(msg.timestamp)}
											</p>
										</div>
									</div>
								</div>
							))}

							{/* Typing indicator */}
							{isTyping && (
								<div className="flex justify-start animate-fadeIn">
									<div className="flex items-end space-x-3 max-w-xs lg:max-w-md">
										<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm">
											🔮
										</div>
										<div className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-2xl rounded-bl-md px-4 py-3">
											<div className="flex space-x-1">
												<div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
												<div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
												<div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
											</div>
										</div>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</div>

						{/* Scroll to bottom button */}
						{showScrollButton && (
							<button
								onClick={scrollToBottom}
								className="absolute bottom-24 right-6 p-3 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10">
								<ArrowDown className="w-5 h-5 text-white" />
							</button>
						)}

						{/* Input area */}
						<div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-3 sm:p-6">
							<div className="flex items-center space-x-2 sm:space-x-4">
								<button className="hidden sm:block p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0">
									<Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
								</button>

								<div className="flex-1 relative">
									<textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										onKeyPress={handleKeyPress}
										placeholder="Ask me about your birth chart, planetary positions, or any astrological insights..."
										className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300 hover:bg-white/15"
										rows={1}
									/>
								</div>

								<button className="hidden sm:block p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0">
									<Smile className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
								</button>

								<button
									onClick={sendMessage}
									className="p-2.5 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full transition-all duration-300 hover:scale-110 shadow-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={!message.trim()}>
									<Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Support Modal */}
			<SupportModal
				isOpen={showSupportModal}
				onClose={() => setShowSupportModal(false)}
				kofiUsername="buildersahaj"
				upiId="9108342605@ybl"
			/>
		</div>
	);
};

export default ChatInterface;
