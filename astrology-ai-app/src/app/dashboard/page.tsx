import { Header } from "@/components/Header";
import Link from "next/link";

export default function Dashboard() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
			<Header />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Your Cosmic Dashboard
					</h1>
					<p className="text-gray-600">
						Welcome back! Explore your astrological journey.
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Quick Actions */}
					<div className="bg-white rounded-xl p-6 shadow-lg">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4">
								<span className="text-white text-xl">+</span>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									New Birth Chart
								</h3>
								<p className="text-gray-600 text-sm">Create your first chart</p>
							</div>
						</div>
						<Link
							href="/charts/new"
							className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
							Create Chart
						</Link>
					</div>

					{/* Recent Readings */}
					<div className="bg-white rounded-xl p-6 shadow-lg">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4">
								<span className="text-white text-xl">📖</span>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Recent Readings
								</h3>
								<p className="text-gray-600 text-sm">Your latest insights</p>
							</div>
						</div>
						<div className="space-y-2">
							<p className="text-gray-500 text-sm">No readings yet</p>
							<Link
								href="/readings/new"
								className="text-purple-600 hover:text-purple-700 text-sm font-medium">
								Get your first reading →
							</Link>
						</div>
					</div>

					{/* Daily Horoscope */}
					<div className="bg-white rounded-xl p-6 shadow-lg">
						<div className="flex items-center mb-4">
							<div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4">
								<span className="text-white text-xl">✨</span>
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Daily Horoscope
								</h3>
								<p className="text-gray-600 text-sm">Today's guidance</p>
							</div>
						</div>
						<Link
							href="/horoscope"
							className="text-purple-600 hover:text-purple-700 text-sm font-medium">
							View today's horoscope →
						</Link>
					</div>
				</div>

				{/* Placeholder for future features */}
				<div className="mt-12">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">Coming Soon</h2>
					<div className="grid md:grid-cols-2 gap-6">
						<div className="bg-white rounded-xl p-6 shadow-lg">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Compatibility Analysis
							</h3>
							<p className="text-gray-600 mb-4">
								Compare your chart with others to understand relationships and
								compatibility.
							</p>
							<span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
								Coming Soon
							</span>
						</div>

						<div className="bg-white rounded-xl p-6 shadow-lg">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Transit Readings
							</h3>
							<p className="text-gray-600 mb-4">
								Get insights about current planetary transits and their impact
								on your life.
							</p>
							<span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
								Coming Soon
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
