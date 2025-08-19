"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	Send,
	Paperclip,
	Smile,
	Phone,
	Video,
	MoreVertical,
	Search,
	ArrowDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatInterface = () => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([
		{
			id: 1,
			text: "Namaste! 🙏 Welcome to Jyotish AI - Your Cosmic Guide to Vedic Wisdom. I'm here to help you discover the ancient wisdom of your birth chart and planetary influences.",
			sender: "other",
			timestamp: new Date(Date.now() - 300000),
			avatar: "🔮",
		},
		{
			id: 2,
			text: "To provide you with accurate Vedic astrology insights, I'll need your birth details:\n\n📅 **Date of Birth** (DD/MM/YYYY)\n⏰ **Time of Birth** (24-hour format)\n📍 **Place of Birth** (City, Country)\n\nPlease share these details so I can calculate your precise birth chart and offer personalized guidance.",
			sender: "other",
			timestamp: new Date(Date.now() - 240000),
			avatar: "🔮",
		},
	]);
	const [isTyping, setIsTyping] = useState(false);
	const [showScrollButton, setShowScrollButton] = useState(false);
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
			const newMessage = {
				id: messages.length + 1,
				text: message,
				sender: "me",
				timestamp: new Date(),
				avatar: "👤",
			};
			setMessages((prev) => [...prev, newMessage]);
			setMessage("");

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

				setIsTyping(false);
				const botResponse = {
					id: messages.length + 2,
					text: data.response,
					sender: "other",
					timestamp: new Date(),
					avatar: "🔮",
				};
				setMessages((prev) => [...prev, botResponse]);
			} catch (error) {
				console.error("Error calling AI API:", error);
				setIsTyping(false);
				const errorResponse = {
					id: messages.length + 2,
					text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment. For accurate astrological guidance, please ensure you provide your complete birth details including date, time, and place of birth.",
					sender: "other",
					timestamp: new Date(),
					avatar: "🔮",
				};
				setMessages((prev) => [...prev, errorResponse]);
			}
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	return (
		<div className="h-screen w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
				<div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
				<div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
			</div>

			<div className="w-full max-w-4xl h-full max-h-[900px] relative">
				{/* Chat container with glassmorphism */}
				<div className="h-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
					{/* Header */}
					<div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
								🔮
							</div>
							<div>
								<h1 className="text-white font-semibold text-xl">Jyotish AI</h1>
								<p className="text-white/70 text-sm">
									Your Cosmic Guide to Vedic Wisdom
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110">
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
							</button>
						</div>
					</div>

					{/* Messages */}
					<div
						ref={chatContainerRef}
						onScroll={handleScroll}
						className="flex-1 overflow-y-auto p-6 space-y-4 chat-scrollbar">
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
									className={`flex items-end space-x-3 max-w-xs lg:max-w-md ${
										msg.sender === "me"
											? "flex-row-reverse space-x-reverse"
											: ""
									}`}>
									{msg.sender === "other" && (
										<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
											{msg.avatar}
										</div>
									)}
									<div
										className={`px-4 py-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
											msg.sender === "me"
												? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
												: "bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-bl-md"
										}`}>
										{msg.sender === "me" ? (
											<p className="text-sm whitespace-pre-line">{msg.text}</p>
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
															<em className="italic text-white">{children}</em>
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
											</div>
										)}
										<p
											className={`text-xs mt-1 ${
												msg.sender === "me" ? "text-white/80" : "text-white/60"
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
					<div className="bg-white/5 backdrop-blur-sm border-t border-white/10 p-6">
						<div className="flex items-center space-x-4">
							<button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0">
								<Paperclip className="w-5 h-5 text-white" />
							</button>

							<div className="flex-1 relative">
								<textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Enter your birth details (Date, Time, Place)..."
									className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300 hover:bg-white/15"
									rows={1}
								/>
							</div>

							<button className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0">
								<Smile className="w-5 h-5 text-white" />
							</button>

							<button
								onClick={sendMessage}
								className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full transition-all duration-300 hover:scale-110 shadow-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={!message.trim()}>
								<Send className="w-5 h-5 text-white" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatInterface;
