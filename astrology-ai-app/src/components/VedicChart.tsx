"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, Star, Zap } from "lucide-react";
import { useState } from "react";
import {
	cn,
	formatDegree,
	getSignColor,
	getPlanetColor,
	getHouseSignificance,
} from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Planet {
	name: string;
	degree: number;
	house: number;
	sign: string;
	symbol: string;
}

interface VedicChartProps {
	planets?: Planet[];
	title?: string;
}

const defaultPlanets: Planet[] = [
	{ name: "Sun", degree: 15.5, house: 1, sign: "Aries", symbol: "☉" },
	{ name: "Moon", degree: 28.3, house: 4, sign: "Cancer", symbol: "☽" },
	{ name: "Mars", degree: 7.2, house: 10, sign: "Capricorn", symbol: "♂" },
	{ name: "Mercury", degree: 22.8, house: 2, sign: "Taurus", symbol: "☿" },
	{ name: "Jupiter", degree: 12.1, house: 9, sign: "Sagittarius", symbol: "♃" },
	{ name: "Venus", degree: 5.7, house: 11, sign: "Aquarius", symbol: "♀" },
	{ name: "Saturn", degree: 19.4, house: 8, sign: "Scorpio", symbol: "♄" },
	{ name: "Rahu", degree: 14.9, house: 6, sign: "Virgo", symbol: "☊" },
	{ name: "Ketu", degree: 14.9, house: 12, sign: "Pisces", symbol: "☋" },
];

const houseLabels = [
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
	"X",
	"XI",
	"XII",
];

export default function VedicChart({
	planets = defaultPlanets,
	title = "Birth Chart",
}: VedicChartProps) {
	const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
	const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);

	// Group planets by house
	const planetsByHouse = planets.reduce((acc, planet) => {
		if (!acc[planet.house]) acc[planet.house] = [];
		acc[planet.house].push(planet);
		return acc;
	}, {} as Record<number, Planet[]>);

	const HouseCell = ({
		houseNumber,
		position,
	}: {
		houseNumber: number;
		position: string;
	}) => {
		const housePlanets = planetsByHouse[houseNumber] || [];
		const isSelected = selectedHouse === houseNumber;
		const isAscendant = houseNumber === 1;
		const isAngular = [1, 4, 7, 10].includes(houseNumber);
		const isTrine = [1, 5, 9].includes(houseNumber);

		return (
			<motion.div
				className={cn(
					"relative border border-border/50 p-2 text-xs cursor-pointer transition-all duration-300",
					position,
					isSelected &&
						"ring-2 ring-purple-500 ring-offset-2 ring-offset-background",
					isAscendant &&
						"bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30",
					isAngular &&
						!isAscendant &&
						"bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30",
					isTrine &&
						!isAscendant &&
						"bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30",
					!isAngular &&
						!isTrine &&
						"bg-gradient-to-br from-gray-500/5 to-gray-500/10 border-border/30",
					"hover:shadow-lg hover:scale-105"
				)}
				onClick={() => setSelectedHouse(isSelected ? null : houseNumber)}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				layout>
				<div className="flex items-center justify-between mb-1">
					<div
						className={cn(
							"font-bold text-xs",
							isAscendant && "text-red-400",
							isAngular && !isAscendant && "text-blue-400",
							isTrine && !isAscendant && "text-yellow-400",
							!isAngular && !isTrine && "text-muted-foreground"
						)}>
						{houseLabels[houseNumber - 1]}
						{isAscendant && " (ASC)"}
					</div>
					{housePlanets.length > 0 && (
						<Star className="h-3 w-3 text-purple-400" />
					)}
				</div>

				<AnimatePresence>
					{housePlanets.map((planet, i) => (
						<motion.div
							key={`${planet.name}-${i}`}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className={cn(
								"flex items-center gap-1 mb-1 p-1 rounded transition-colors",
								"hover:bg-background/50 cursor-pointer"
							)}
							onMouseEnter={() => setHoveredPlanet(planet)}
							onMouseLeave={() => setHoveredPlanet(null)}>
							<span className={cn("text-base", getPlanetColor(planet.name))}>
								{planet.symbol}
							</span>
							<span className="text-xs text-muted-foreground">
								{formatDegree(planet.degree)}
							</span>
						</motion.div>
					))}
				</AnimatePresence>
			</motion.div>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-4xl mx-auto">
			<Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-xl">
				<CardHeader className="text-center">
					<CardTitle className="flex items-center justify-center gap-2">
						<Star className="h-5 w-5 text-purple-400" />
						{title}
						<Star className="h-5 w-5 text-purple-400" />
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						North Indian Style Vedic Chart
					</p>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Main Chart */}
					<div className="flex flex-col lg:flex-row gap-8 items-start">
						<div className="flex-1">
							<motion.div
								className="relative mx-auto"
								style={{ width: "400px", height: "400px" }}
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.6, delay: 0.2 }}>
								<div className="grid grid-cols-5 grid-rows-5 gap-0 w-full h-full">
									{/* Houses arranged in North Indian style */}
									<HouseCell
										houseNumber={11}
										position="col-start-1 row-start-1"
									/>
									<HouseCell
										houseNumber={10}
										position="col-start-2 row-start-1"
									/>
									<HouseCell
										houseNumber={1}
										position="col-start-3 row-start-1"
									/>
									<HouseCell
										houseNumber={2}
										position="col-start-4 row-start-1"
									/>
									<HouseCell
										houseNumber={12}
										position="col-start-5 row-start-1"
									/>

									<HouseCell
										houseNumber={9}
										position="col-start-1 row-start-2"
									/>
									<div className="col-start-2 row-start-2 col-span-3 row-span-3 border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-blue-500/10 rounded-lg flex items-center justify-center relative overflow-hidden">
										<motion.div
											className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5"
											animate={{ rotate: 360 }}
											transition={{
												duration: 60,
												repeat: Infinity,
												ease: "linear",
											}}
										/>
										<div className="text-center relative z-10">
											<motion.div
												className="text-lg font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-1"
												animate={{ scale: [1, 1.05, 1] }}
												transition={{ duration: 3, repeat: Infinity }}>
												जन्म पत्रिका
											</motion.div>
											<div className="text-sm text-muted-foreground">
												Birth Chart
											</div>
											<Zap className="h-4 w-4 text-purple-400 mx-auto mt-2" />
										</div>
									</div>
									<HouseCell
										houseNumber={3}
										position="col-start-5 row-start-2"
									/>

									<HouseCell
										houseNumber={8}
										position="col-start-1 row-start-3"
									/>
									<HouseCell
										houseNumber={4}
										position="col-start-5 row-start-3"
									/>

									<HouseCell
										houseNumber={7}
										position="col-start-1 row-start-4"
									/>
									<HouseCell
										houseNumber={5}
										position="col-start-5 row-start-4"
									/>

									<HouseCell
										houseNumber={6}
										position="col-start-3 row-start-5"
									/>
								</div>
							</motion.div>
						</div>

						{/* Side Panel */}
						<div className="lg:w-80 w-full space-y-4">
							{/* Planet Legend */}
							<Card className="border-border/30">
								<CardHeader>
									<CardTitle className="text-sm flex items-center gap-2">
										<Star className="h-4 w-4 text-yellow-400" />
										Planetary Positions
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									{planets.map((planet, i) => (
										<motion.div
											key={i}
											className={cn(
												"flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
												hoveredPlanet?.name === planet.name
													? "bg-purple-500/10 border border-purple-500/30"
													: "hover:bg-muted/50"
											)}
											whileHover={{ x: 4 }}>
											<span
												className={cn("text-lg", getPlanetColor(planet.name))}>
												{planet.symbol}
											</span>
											<div className="flex-1">
												<div className="flex items-center justify-between">
													<span className="font-medium text-sm">
														{planet.name}
													</span>
													<span className="text-xs text-muted-foreground">
														House {planet.house}
													</span>
												</div>
												<div className="flex items-center gap-2 text-xs text-muted-foreground">
													<span className={getSignColor(planet.sign)}>
														{planet.sign}
													</span>
													<span>{formatDegree(planet.degree)}</span>
												</div>
											</div>
										</motion.div>
									))}
								</CardContent>
							</Card>

							{/* House Information */}
							<AnimatePresence>
								{selectedHouse && (
									<motion.div
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 20 }}>
										<Card className="border-purple-500/30 bg-purple-500/5">
											<CardHeader>
												<CardTitle className="text-sm flex items-center gap-2">
													<Info className="h-4 w-4 text-purple-400" />
													House {selectedHouse} -{" "}
													{houseLabels[selectedHouse - 1]}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-sm text-muted-foreground">
													{getHouseSignificance(selectedHouse)}
												</p>
												{planetsByHouse[selectedHouse] && (
													<div className="mt-3 space-y-1">
														<p className="text-xs font-medium">
															Planets in this house:
														</p>
														{planetsByHouse[selectedHouse].map((planet, i) => (
															<div
																key={i}
																className="text-xs flex items-center gap-2">
																<span className={getPlanetColor(planet.name)}>
																	{planet.symbol}
																</span>
																<span>{planet.name}</span>
																<span className="text-muted-foreground">
																	{formatDegree(planet.degree)}
																</span>
															</div>
														))}
													</div>
												)}
											</CardContent>
										</Card>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
