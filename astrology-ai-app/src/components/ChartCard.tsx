"use client";

import { motion } from "framer-motion";
import { Star, Info } from "lucide-react";
import { cn, getPlanetColor, getSignColor, formatDegree } from "../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Planet {
	name: string;
	degree: number;
	house: number;
	sign: string;
	symbol: string;
}

interface ChartCardProps {
	data: Planet[];
	className?: string;
}

export default function ChartCard({ data, className }: ChartCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
			className={cn("w-full", className)}
		>
			<Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm">
						<Star className="h-4 w-4 text-purple-400" />
						Birth Chart Analysis
						<Info className="h-3 w-3 text-muted-foreground ml-auto" />
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{data.map((planet, index) => (
							<motion.div
								key={planet.name}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
								className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200"
							>
								<span className={cn("text-lg", getPlanetColor(planet.name))}>
									{planet.symbol}
								</span>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm truncate">
											{planet.name}
										</span>
										<span className="text-xs text-muted-foreground">
											H{planet.house}
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
					</div>
					
					{/* Summary */}
					<div className="pt-2 border-t border-border/30">
						<div className="flex items-center justify-between text-xs text-muted-foreground">
							<span>Total Planets: {data.length}</span>
							<span>Vedic Chart</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
