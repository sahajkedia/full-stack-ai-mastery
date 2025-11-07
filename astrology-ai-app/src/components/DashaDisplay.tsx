"use client";

import React from "react";
import { Card } from "./ui/card";

interface DashaPeriod {
	planet: string;
	startDate: string;
	endDate: string;
	remaining: string;
}

interface DashaData {
	currentMahadasha: DashaPeriod;
	currentAntardasha: DashaPeriod;
	currentPratyantardasha: DashaPeriod;
	calculatedAt: string;
}

interface DashaDisplayProps {
	dashaData: DashaData;
	className?: string;
}

const planetColors: { [key: string]: string } = {
	Sun: "text-yellow-600 bg-yellow-50 border-yellow-200",
	Moon: "text-blue-600 bg-blue-50 border-blue-200",
	Mars: "text-red-600 bg-red-50 border-red-200",
	Mercury: "text-green-600 bg-green-50 border-green-200",
	Jupiter: "text-purple-600 bg-purple-50 border-purple-200",
	Venus: "text-pink-600 bg-pink-50 border-pink-200",
	Saturn: "text-gray-600 bg-gray-50 border-gray-200",
	Rahu: "text-indigo-600 bg-indigo-50 border-indigo-200",
	Ketu: "text-orange-600 bg-orange-50 border-orange-200",
};

const planetIcons: { [key: string]: string } = {
	Sun: "☉",
	Moon: "☽",
	Mars: "♂",
	Mercury: "☿",
	Jupiter: "♃",
	Venus: "♀",
	Saturn: "♄",
	Rahu: "☊",
	Ketu: "☋",
};

export default function DashaDisplay({
	dashaData,
	className = "",
}: DashaDisplayProps) {
	const {
		currentMahadasha,
		currentAntardasha,
		currentPratyantardasha,
		calculatedAt,
	} = dashaData;

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const DashaPeriodCard = ({
		period,
		title,
		level,
	}: {
		period: DashaPeriod;
		title: string;
		level: "mahadasha" | "antardasha" | "pratyantardasha";
	}) => {
		const colorClass =
			planetColors[period.planet] || "text-gray-600 bg-gray-50 border-gray-200";
		const icon = planetIcons[period.planet] || "●";

		return (
			<Card className={`p-4 border-2 ${colorClass} ${className}`}>
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center space-x-2">
						<span className="text-2xl">{icon}</span>
						<h3 className="font-semibold text-lg">{title}</h3>
					</div>
					<span className="text-sm opacity-75 capitalize">{level}</span>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="opacity-75">Planet:</span>
						<span className="font-medium">{period.planet}</span>
					</div>

					<div className="flex justify-between text-sm">
						<span className="opacity-75">Start:</span>
						<span>{formatDate(period.startDate)}</span>
					</div>

					<div className="flex justify-between text-sm">
						<span className="opacity-75">End:</span>
						<span>{formatDate(period.endDate)}</span>
					</div>

					<div className="flex justify-between text-sm font-medium">
						<span className="opacity-75">Remaining:</span>
						<span className="text-green-600">{period.remaining}</span>
					</div>
				</div>
			</Card>
		);
	};

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="text-center mb-6">
				<h2 className="text-2xl font-bold text-gray-800 mb-2">
					Current Dasha Periods
				</h2>
				<p className="text-sm text-gray-600">
					Calculated on {formatDate(calculatedAt)}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<DashaPeriodCard
					period={currentMahadasha}
					title="Mahadasha"
					level="mahadasha"
				/>

				<DashaPeriodCard
					period={currentAntardasha}
					title="Antardasha"
					level="antardasha"
				/>

				<DashaPeriodCard
					period={currentPratyantardasha}
					title="Pratyantardasha"
					level="pratyantardasha"
				/>
			</div>

			<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<h3 className="font-semibold text-blue-800 mb-2">
					About Dasha Periods
				</h3>
				<p className="text-sm text-blue-700">
					Dasha periods are planetary time cycles in Vedic astrology that
					influence different aspects of life. The Mahadasha (major period)
					lasts for years, Antardasha (sub-period) for months, and
					Pratyantardasha (sub-sub-period) for days.
				</p>
			</div>
		</div>
	);
}
