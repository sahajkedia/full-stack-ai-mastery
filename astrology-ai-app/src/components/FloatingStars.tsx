"use client";

import { useEffect, useState } from "react";

export default function FloatingStars() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return null;
	}

	return (
		<>
			{[...Array(20)].map((_, i) => {
				// Use a consistent seed based on index to avoid hydration mismatch
				const seed = i * 0.1;
				const left = ((Math.sin(seed * 100) + 1) / 2) * 100;
				const top = ((Math.cos(seed * 150) + 1) / 2) * 100;
				const delay = (Math.sin(seed * 200) + 1) * 1.5;
				const duration = 2 + (Math.sin(seed * 300) + 1);

				return (
					<div
						key={i}
						className="absolute w-1 h-1 bg-white rounded-full floating-stars"
						style={{
							left: `${left}%`,
							top: `${top}%`,
							animationDelay: `${delay}s`,
							animationDuration: `${duration}s`,
						}}
					/>
				);
			})}
		</>
	);
}
