"use client";

import { useEffect, useState } from "react";

export default function ConstellationPattern() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return null;
	}

	return (
		<svg className="absolute inset-0 w-full h-full opacity-20">
			<defs>
				<pattern
					id="constellation"
					patternUnits="userSpaceOnUse"
					width="200"
					height="200">
					<circle
						cx="50"
						cy="50"
						r="1"
						fill="#ffffff"
						opacity="0.6"
						className="constellation-twinkle"
					/>
					<circle
						cx="150"
						cy="100"
						r="1"
						fill="#ffffff"
						opacity="0.6"
						className="constellation-twinkle"
						style={{ animationDelay: "0.5s" }}
					/>
					<circle
						cx="100"
						cy="150"
						r="1"
						fill="#ffffff"
						opacity="0.6"
						className="constellation-twinkle"
						style={{ animationDelay: "1s" }}
					/>
					<line
						x1="50"
						y1="50"
						x2="150"
						y2="100"
						stroke="#ffffff"
						strokeWidth="0.5"
						opacity="0.3"
					/>
					<line
						x1="150"
						y1="100"
						x2="100"
						y2="150"
						stroke="#ffffff"
						strokeWidth="0.5"
						opacity="0.3"
					/>
				</pattern>
			</defs>
			<rect
				width="100%"
				height="100%"
				fill="url(#constellation)"
			/>
		</svg>
	);
}
