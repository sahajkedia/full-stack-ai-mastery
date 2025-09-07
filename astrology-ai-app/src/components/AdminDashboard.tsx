"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
	RefreshCw,
	Users,
	MessageSquare,
	BarChart3,
	Calendar,
} from "lucide-react";

interface DashboardStats {
	totalSessions: number;
	activeSessions: number;
	totalCharts: number;
	totalMessages: number;
	averageMessagesPerSession: number;
	chartAdoptionRate: number;
}

interface ChartUsageStats {
	totalCharts: number;
	successfulCharts: number;
	failedCharts: number;
	successRate: number;
	averageResponseTime: number;
}

interface UserEngagementStats {
	totalSessions: number;
	averageEventsPerSession: number;
	sessionsWithCharts: number;
	chartAdoptionRate: number;
}

export default function AdminDashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [chartStats, setChartStats] = useState<ChartUsageStats | null>(null);
	const [engagementStats, setEngagementStats] =
		useState<UserEngagementStats | null>(null);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"overview" | "charts" | "engagement"
	>("overview");

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		setLoading(true);
		try {
			// Load basic stats
			const [basicResponse, chartResponse, engagementResponse] =
				await Promise.all([
					fetch("/api/mongodb/analytics?action=dashboard"),
					fetch("/api/mongodb/analytics?action=chartUsage"),
					fetch("/api/mongodb/analytics?action=userEngagement"),
				]);

			if (basicResponse.ok) {
				const basicData = await basicResponse.json();
				setStats(basicData.data);
			}

			if (chartResponse.ok) {
				const chartData = await chartResponse.json();
				setChartStats(chartData.data);
			}

			if (engagementResponse.ok) {
				const engagementData = await engagementResponse.json();
				setEngagementStats(engagementData.data);
			}
		} catch (error) {
			console.error("Error loading stats:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatNumber = (num: number) => {
		return new Intl.NumberFormat().format(num);
	};

	const formatPercentage = (num: number) => {
		return `${(num * 100).toFixed(1)}%`;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">
						Admin Dashboard
					</h1>
					<p className="text-slate-300">
						Monitor your Astrology AI App performance and user engagement
					</p>
				</div>

				{/* Refresh Button */}
				<div className="mb-6">
					<Button
						onClick={loadStats}
						disabled={loading}
						className="bg-purple-600 hover:bg-purple-700 text-white">
						<RefreshCw
							className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Refresh Data
					</Button>
				</div>

				{/* Tab Navigation */}
				<div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
					<button
						onClick={() => setActiveTab("overview")}
						className={`px-4 py-2 rounded-md transition-colors ${
							activeTab === "overview"
								? "bg-purple-600 text-white"
								: "text-slate-300 hover:text-white"
						}`}>
						Overview
					</button>
					<button
						onClick={() => setActiveTab("charts")}
						className={`px-4 py-2 rounded-md transition-colors ${
							activeTab === "charts"
								? "bg-purple-600 text-white"
								: "text-slate-300 hover:text-white"
						}`}>
						Chart Usage
					</button>
					<button
						onClick={() => setActiveTab("engagement")}
						className={`px-4 py-2 rounded-md transition-colors ${
							activeTab === "engagement"
								? "bg-purple-600 text-white"
								: "text-slate-300 hover:text-white"
						}`}>
						User Engagement
					</button>
				</div>

				{/* Content */}
				{activeTab === "overview" && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card className="bg-slate-800 border-slate-700">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-slate-300">
									Total Sessions
								</CardTitle>
								<Users className="h-4 w-4 text-purple-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">
									{stats ? formatNumber(stats.totalSessions) : "..."}
								</div>
								<p className="text-xs text-slate-400">
									{stats?.activeSessions} active sessions
								</p>
							</CardContent>
						</Card>

						<Card className="bg-slate-800 border-slate-700">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-slate-300">
									Total Charts
								</CardTitle>
								<BarChart3 className="h-4 w-4 text-blue-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">
									{stats ? formatNumber(stats.totalCharts) : "..."}
								</div>
								<p className="text-xs text-slate-400">
									{stats?.chartAdoptionRate
										? `${formatPercentage(
												stats.chartAdoptionRate
										  )} adoption rate`
										: "Calculating..."}
								</p>
							</CardContent>
						</Card>

						<Card className="bg-slate-800 border-slate-700">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-slate-300">
									Total Messages
								</CardTitle>
								<MessageSquare className="h-4 w-4 text-green-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">
									{stats ? formatNumber(stats.totalMessages) : "..."}
								</div>
								<p className="text-xs text-slate-400">
									{stats?.averageMessagesPerSession
										? `${stats.averageMessagesPerSession.toFixed(
												1
										  )} per session`
										: "Calculating..."}
								</p>
							</CardContent>
						</Card>

						<Card className="bg-slate-800 border-slate-700">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium text-slate-300">
									Chart Adoption
								</CardTitle>
								<Calendar className="h-4 w-4 text-yellow-400" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-white">
									{stats?.chartAdoptionRate
										? formatPercentage(stats.chartAdoptionRate)
										: "..."}
								</div>
								<p className="text-xs text-slate-400">
									of sessions include charts
								</p>
							</CardContent>
						</Card>
					</div>
				)}

				{activeTab === "charts" && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card className="bg-slate-800 border-slate-700">
							<CardHeader>
								<CardTitle className="text-slate-200">
									Chart Generation
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex justify-between">
										<span className="text-slate-300">Total Charts:</span>
										<span className="text-white font-semibold">
											{chartStats
												? formatNumber(chartStats.totalCharts)
												: "..."}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-300">Successful:</span>
										<span className="text-green-400 font-semibold">
											{chartStats
												? formatNumber(chartStats.successfulCharts)
												: "..."}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-300">Failed:</span>
										<span className="text-red-400 font-semibold">
											{chartStats
												? formatNumber(chartStats.failedCharts)
												: "..."}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-300">Success Rate:</span>
										<span className="text-white font-semibold">
											{chartStats
												? formatPercentage(chartStats.successRate)
												: "..."}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-slate-800 border-slate-700">
							<CardHeader>
								<CardTitle className="text-slate-200">Performance</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex justify-between">
										<span className="text-slate-300">Avg Response Time:</span>
										<span className="text-white font-semibold">
											{chartStats?.averageResponseTime
												? `${chartStats.averageResponseTime.toFixed(2)}s`
												: "..."}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-300">API Calls Saved:</span>
										<span className="text-blue-400 font-semibold">
											{stats?.totalCharts && chartStats?.totalCharts
												? formatNumber(
														stats.totalCharts - chartStats.totalCharts
												  )
												: "..."}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{activeTab === "engagement" && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card className="bg-slate-800 border-slate-700">
							<CardHeader>
								<CardTitle className="text-slate-200">
									Session Metrics
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex justify-between">
										<span className="text-slate-300">Total Sessions:</span>
										<span className="text-white font-semibold">
											{engagementStats
												? formatNumber(engagementStats.totalSessions)
												: "..."}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-300">Avg Events/Session:</span>
										<span className="text-white font-semibold">
											{engagementStats?.averageEventsPerSession
												? engagementStats.averageEventsPerSession.toFixed(1)
												: "..."}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-300">With Charts:</span>
										<span className="text-green-400 font-semibold">
											{engagementStats
												? formatNumber(engagementStats.sessionsWithCharts)
												: "..."}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-slate-800 border-slate-700">
							<CardHeader>
								<CardTitle className="text-slate-200">User Behavior</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex justify-between">
										<span className="text-slate-300">Chart Adoption:</span>
										<span className="text-white font-semibold">
											{engagementStats?.chartAdoptionRate
												? formatPercentage(engagementStats.chartAdoptionRate)
												: "..."}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-slate-300">Engagement Level:</span>
										<span className="text-blue-400 font-semibold">
											{engagementStats?.averageEventsPerSession
												? engagementStats.averageEventsPerSession > 10
													? "High"
													: engagementStats.averageEventsPerSession > 5
													? "Medium"
													: "Low"
												: "..."}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="text-center py-12">
						<RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
						<p className="text-slate-300">Loading statistics...</p>
					</div>
				)}

				{/* No Data State */}
				{!loading && !stats && (
					<div className="text-center py-12">
						<p className="text-slate-300 mb-4">No data available</p>
						<Button
							onClick={loadStats}
							className="bg-purple-600 hover:bg-purple-700">
							Try Again
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

