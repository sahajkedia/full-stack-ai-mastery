import { useEffect, useRef, useState } from "react";

interface UseScrollToBottomProps {
	dependencies?: unknown[];
	threshold?: number;
	behavior?: ScrollBehavior;
}

export function useScrollToBottom({
	dependencies = [],
	threshold = 100,
	behavior = "smooth",
}: UseScrollToBottomProps = {}) {
	const [isNearBottom, setIsNearBottom] = useState(true);
	const [userHasScrolled, setUserHasScrolled] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	// Handle scroll events to detect user scrolling
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleScroll = () => {
			const { scrollTop, scrollHeight, clientHeight } = container;
			const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
			setIsNearBottom(distanceFromBottom <= threshold);
			setUserHasScrolled(true);
		};

		container.addEventListener("scroll", handleScroll);
		return () => container.removeEventListener("scroll", handleScroll);
	}, [threshold]);

	// Auto-scroll to bottom when dependencies change
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Only auto-scroll if user hasn't scrolled up or is already near bottom
		if (!userHasScrolled || isNearBottom) {
			const scrollToBottom = () => {
				container.scrollTo({
					top: container.scrollHeight,
					behavior,
				});
			};

			// Use requestAnimationFrame to ensure DOM has updated
			requestAnimationFrame(scrollToBottom);
		}
	}, [behavior, isNearBottom, userHasScrolled, ...dependencies]);

	// Set up intersection observer for scroll-to-bottom button visibility
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const options = {
			root: container,
			threshold: 0.1,
		};

		observerRef.current = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				setIsNearBottom(entry.isIntersecting);
			});
		}, options);

		// Add a sentinel element at the bottom
		const sentinel = document.createElement("div");
		sentinel.style.height = "1px";
		container.appendChild(sentinel);
		observerRef.current.observe(sentinel);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
			container.removeChild(sentinel);
		};
	}, []);

	const scrollToBottom = () => {
		const container = containerRef.current;
		if (!container) return;

		container.scrollTo({
			top: container.scrollHeight,
			behavior,
		});
		setUserHasScrolled(false);
	};

	return {
		containerRef,
		isNearBottom,
		scrollToBottom,
	};
}
