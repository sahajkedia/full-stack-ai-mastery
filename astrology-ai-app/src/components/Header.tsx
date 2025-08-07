"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
	const { data: session } = useSession();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">★</span>
						</div>
						<span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
							Astrology AI
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-8">
						<Link
							href="/features"
							className="text-gray-700 hover:text-purple-600 transition-colors">
							Features
						</Link>
						<Link
							href="/about"
							className="text-gray-700 hover:text-purple-600 transition-colors">
							About
						</Link>
						<Link
							href="/pricing"
							className="text-gray-700 hover:text-purple-600 transition-colors">
							Pricing
						</Link>
					</nav>

					{/* Auth Buttons */}
					<div className="hidden md:flex items-center space-x-4">
						{session ? (
							<div className="flex items-center space-x-4">
								<Link
									href="/dashboard"
									className="text-gray-700 hover:text-purple-600 transition-colors">
									Dashboard
								</Link>
								<button
									onClick={() => signOut()}
									className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors">
									Sign Out
								</button>
								{session.user?.image && (
									<img
										src={session.user.image}
										alt="Profile"
										className="w-8 h-8 rounded-full"
									/>
								)}
							</div>
						) : (
							<div className="flex items-center space-x-4">
								<button
									onClick={() => signIn()}
									className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors">
									Sign In
								</button>
								<button
									onClick={() => signIn()}
									className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
									Get Started
								</button>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 transition-colors">
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-gray-200">
						<nav className="flex flex-col space-y-4">
							<Link
								href="/features"
								className="text-gray-700 hover:text-purple-600 transition-colors">
								Features
							</Link>
							<Link
								href="/about"
								className="text-gray-700 hover:text-purple-600 transition-colors">
								About
							</Link>
							<Link
								href="/pricing"
								className="text-gray-700 hover:text-purple-600 transition-colors">
								Pricing
							</Link>
							{session ? (
								<div className="flex flex-col space-y-2">
									<Link
										href="/dashboard"
										className="text-gray-700 hover:text-purple-600 transition-colors">
										Dashboard
									</Link>
									<button
										onClick={() => signOut()}
										className="text-left text-gray-700 hover:text-purple-600 transition-colors">
										Sign Out
									</button>
								</div>
							) : (
								<div className="flex flex-col space-y-2">
									<button
										onClick={() => signIn()}
										className="text-left text-gray-700 hover:text-purple-600 transition-colors">
										Sign In
									</button>
									<button
										onClick={() => signIn()}
										className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
										Get Started
									</button>
								</div>
							)}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
