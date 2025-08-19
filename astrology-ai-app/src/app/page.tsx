"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stars, MessageCircle, Eye, Sparkles } from "lucide-react";
import VedicChart from "../components/VedicChart";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import ScrollToBottomButton from "../components/ScrollToBottomButton";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { cn } from "../lib/utils";
import { useScrollToBottom } from "../hooks/useScrollToBottom";

interface Planet {
	name: string;
	degree: number;
	house: number;
	sign: string;
	symbol: string;
}

type MessageContent =
	| {
			type: "text";
			text: string;
	  }
	| {
			type: "chart";
			data: Planet[];
	  }
	| {
			type: "image";
			url: string;
			alt: string;
	  };

interface Message {
	role: "user" | "assistant";
	content: MessageContent | MessageContent[];
	timestamp: Date;
}

const suggestedQuestions = [
	"What does my birth chart reveal about my personality?",
	"How do current planetary transits affect me?",
	"What is my life purpose according to Vedic astrology?",
	"Tell me about my career prospects",
];

export default function AstrologyChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showChart, setShowChart] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const { containerRef, isNearBottom, scrollToBottom } = useScrollToBottom({
		dependencies: [messages, showChart],
		threshold: 150,
	});

	// Handle scroll detection for header styling
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleSubmit = async (input: string) => {
		const userMessage: Message = {
			role: "user",
			content: [
				{
					type: "text",
					text: input,
				},
			],
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: [...messages, userMessage] }),
			});

			if (!response.ok) throw new Error("Network response was not ok");

			const { response: aiResponse } = await response.json();

			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: [
						{
							type: "text",
							text: aiResponse,
						},
					],
					timestamp: new Date(),
				},
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: [
						{
							type: "text",
							text: "Sorry, I couldn't process your request. Please try again.",
						},
					],
					timestamp: new Date(),
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSuggestedQuestion = (question: string) => {
		handleSubmit(question);
	};

	return (
		<div
			className="min-h-screen bg-background"
			role="main">
			{/* Animated Background */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none">
				{/* Base gradient */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-800/30 via-background to-blue-900/30" />

				{/* Animated noise texture */}
				<div className="absolute inset-0 opacity-[0.015] mix-blend-overlay">
					<div className="absolute inset-0 bg-repeat bg-noise animate-noise" />
				</div>

				{/* Animated gradient orbs */}
				<motion.div
					className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full"
					style={{
						background:
							"radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0) 70%)",
						filter: "blur(40px)",
					}}
					animate={{
						x: [0, 100, 0],
						y: [0, 50, 0],
						scale: [1, 1.1, 1],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
					style={{
						background:
							"radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 70%)",
						filter: "blur(40px)",
					}}
					animate={{
						x: [0, -100, 0],
						y: [0, -50, 0],
						scale: [1, 1.2, 1],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>

				{/* Floating particles */}
				<div className="absolute inset-0">
					{Array.from({ length: 30 }).map((_, i) => {
						// Use deterministic values based on index
						const row = Math.floor(i / 6);
						const col = i % 6;
						const baseLeft = (col / 5) * 100;
						const baseTop = (row / 4) * 100;

						// Add some variation but keep it deterministic
						const offsetLeft = ((i * 13) % 20) - 10;
						const offsetTop = ((i * 17) % 20) - 10;

						return (
							<motion.div
								key={i}
								className="absolute w-1 h-1 bg-white rounded-full"
								style={{
									left: `${baseLeft + offsetLeft}%`,
									top: `${baseTop + offsetTop}%`,
									opacity: 0.1 + (i % 3) * 0.1,
								}}
								animate={{
									y: [0, -30, 0],
									opacity: [0, 1, 0],
								}}
								transition={{
									duration: 2 + (i % 3),
									repeat: Infinity,
									ease: "easeInOut",
									delay: i * 0.1,
								}}
							/>
						);
					})}
				</div>

				{/* Glass overlay */}
				<div className="absolute inset-0 backdrop-blur-[100px]" />
			</div>

			{/* Header */}
			<motion.header
				className={cn(
					"sticky top-0 z-50 backdrop-blur-xl transition-all duration-300",
					isScrolled
						? "bg-background/80 shadow-2xl border-b border-white/5"
						: "bg-transparent"
				)}
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.5 }}>
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<motion.div
							className="flex items-center gap-4"
							whileHover={{ scale: 1.02 }}>
							<div className="relative">
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-violet-600/50 to-purple-600/50 rounded-2xl blur-xl"
									animate={{
										scale: [1, 1.2, 1],
										opacity: [0.5, 0.3, 0.5],
									}}
									transition={{
										duration: 4,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								/>
								<div
									className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg ring-1 ring-white/10"
									aria-hidden="true">
									<motion.div
										animate={{
											rotate: [0, 360],
										}}
										transition={{
											duration: 20,
											repeat: Infinity,
											ease: "linear",
										}}
										className="absolute inset-[3px] rounded-xl bg-gradient-to-br from-violet-400/20 to-purple-400/20 backdrop-blur-sm"
									/>
									<Sparkles className="h-6 w-6 text-white relative" />
								</div>
								<motion.div
									className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full ring-2 ring-background"
									animate={{
										scale: [1, 1.2, 1],
										opacity: [0.8, 1, 0.8],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "easeInOut",
									}}
									aria-hidden="true"
								/>
							</div>
							<div>
								<motion.h1
									className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 bg-clip-text text-transparent"
									animate={{
										backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
									}}
									transition={{
										duration: 8,
										repeat: Infinity,
										ease: "linear",
									}}
									style={{ backgroundSize: "200% auto" }}>
									Jyotish AI
								</motion.h1>
								<p
									className="text-sm text-purple-300/60"
									role="doc-subtitle">
									Your Cosmic Guide to Vedic Wisdom
								</p>
							</div>
						</motion.div>

						<div className="flex items-center gap-3">
							<Button
								variant="ghost"
								size="lg"
								onClick={() => setShowChart(!showChart)}
								className={cn(
									"gap-2 relative group transition-all duration-300",
									showChart && "text-purple-400 bg-purple-400/10"
								)}
								aria-pressed={showChart}
								aria-label={
									showChart ? "Hide birth chart" : "Show birth chart"
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
								<Eye
									className="h-5 w-5"
									aria-hidden="true"
								/>
								Chart
							</Button>
						</div>
					</div>
				</div>
			</motion.header>

			{/* Main Content */}
			<div className="container mx-auto px-6 py-8 max-w-4xl relative z-10">
				{/* Chart Section */}
				<AnimatePresence>
					{showChart && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className="mb-8">
							<VedicChart />
						</motion.div>
					)}
				</AnimatePresence>

				{/* Chat Area */}
				<div
					ref={containerRef}
					className="space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/80"
					role="log"
					aria-label="Chat messages">
					{messages.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center py-16">
							<motion.div
								className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 mb-6 shadow-xl"
								animate={{
									rotate: [0, 5, -5, 0],
									scale: [1, 1.05, 1],
								}}
								transition={{
									duration: 4,
									repeat: Infinity,
									ease: "easeInOut",
								}}>
								<Stars className="h-10 w-10 text-white" />
							</motion.div>

							<motion.h2
								className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 bg-clip-text text-transparent"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}>
								Welcome to Your Cosmic Journey
							</motion.h2>

							<motion.p
								className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.4 }}>
								Discover the ancient wisdom of Vedic astrology through AI. Ask
								about your birth chart, planetary transits, or seek guidance on
								life&apos;s journey through the stars.
							</motion.p>

							{/* Suggested Questions */}
							<motion.div
								className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}>
								{suggestedQuestions.map((question, index) => (
									<motion.div
										key={index}
										whileHover={{ scale: 1.02, y: -2 }}
										whileTap={{ scale: 0.98 }}>
										<Card
											className="cursor-pointer border-dashed hover:border-solid hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300"
											onClick={() => handleSuggestedQuestion(question)}
											role="button"
											tabIndex={0}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													handleSuggestedQuestion(question);
												}
											}}
											aria-label={`Ask: ${question}`}>
											<CardContent className="p-4">
												<div className="flex items-start gap-3">
													<MessageCircle
														className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0"
														aria-hidden="true"
													/>
													<p className="text-sm text-left">{question}</p>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</motion.div>
						</motion.div>
					) : (
						<div className="space-y-1">
							<AnimatePresence mode="popLayout">
								{messages.map((message, index) => (
									<ChatMessage
										key={index}
										role={message.role}
										content={message.content}
										timestamp={message.timestamp}
									/>
								))}
							</AnimatePresence>

							{isLoading && (
								<ChatMessage
									role="assistant"
									content={[{ type: "text", text: "" }]}
									isLoading={true}
								/>
							)}
							<ScrollToBottomButton
								onClick={scrollToBottom}
								show={isNearBottom}
							/>
						</div>
					)}
				</div>

				{/* Input Area */}
				<ChatInput
					onSubmit={handleSubmit}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
