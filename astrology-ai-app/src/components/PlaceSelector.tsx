"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Place } from "@/types/location";
import { OpenMapAPI } from "@/lib/openmap-api";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface PlaceSelectorProps {
	onPlaceSelect: (place: Place) => void;
	placeholder?: string;
	className?: string;
	initialValue?: string;
}

const PlaceSelector: React.FC<PlaceSelectorProps> = ({
	onPlaceSelect,
	placeholder = "Search for a place...",
	className,
	initialValue = "",
}) => {
	const [query, setQuery] = useState(initialValue);
	const [places, setPlaces] = useState<Place[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [isGettingLocation, setIsGettingLocation] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// Debounced search function
	const debouncedSearch = useCallback(async (searchQuery: string) => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(async () => {
			if (searchQuery.trim().length >= 2) {
				setIsLoading(true);
				try {
					const results = await OpenMapAPI.searchPlaces(searchQuery, 8);
					setPlaces(results);
					setIsOpen(true);
					setSelectedIndex(-1);
				} catch (error) {
					console.error("Search error:", error);
					setPlaces([]);
				} finally {
					setIsLoading(false);
				}
			} else {
				setPlaces([]);
				setIsOpen(false);
			}
		}, 300);
	}, []);

	// Handle input change
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setQuery(value);
		debouncedSearch(value);
	};

	// Handle place selection
	const handlePlaceSelect = (place: Place) => {
		setQuery(OpenMapAPI.formatPlaceDisplayName(place));
		setPlaces([]);
		setIsOpen(false);
		setSelectedIndex(-1);
		onPlaceSelect(place);
	};

	// Handle keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen || places.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) => (prev < places.length - 1 ? prev + 1 : 0));
				break;
			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : places.length - 1));
				break;
			case "Enter":
				e.preventDefault();
				if (selectedIndex >= 0 && selectedIndex < places.length) {
					handlePlaceSelect(places[selectedIndex]);
				}
				break;
			case "Escape":
				setIsOpen(false);
				setSelectedIndex(-1);
				inputRef.current?.blur();
				break;
		}
	};

	// Handle current location
	const handleCurrentLocation = async () => {
		setIsGettingLocation(true);
		try {
			const place = await OpenMapAPI.getCurrentPlace();
			if (place) {
				handlePlaceSelect(place);
			} else {
				alert(
					"Unable to get your current location. Please check your browser permissions."
				);
			}
		} catch (error) {
			console.error("Error getting current location:", error);
			alert("Error getting current location. Please try again.");
		} finally {
			setIsGettingLocation(false);
		}
	};

	// Clear input
	const handleClear = () => {
		setQuery("");
		setPlaces([]);
		setIsOpen(false);
		setSelectedIndex(-1);
		inputRef.current?.focus();
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSelectedIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	return (
		<div className={cn("relative", className)}>
			<div className="relative">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
					<Input
						ref={inputRef}
						type="text"
						value={query}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent pl-10 pr-20"
					/>
					<div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
						{query && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={handleClear}
								className="h-6 w-6 p-0 hover:bg-gray-200">
								<X className="w-3 h-3" />
							</Button>
						)}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleCurrentLocation}
							disabled={isGettingLocation}
							className="h-6 w-6 p-0 hover:bg-gray-200"
							title="Use current location">
							{isGettingLocation ? (
								<Loader2 className="w-3 h-3 animate-spin" />
							) : (
								<MapPin className="w-3 h-3" />
							)}
						</Button>
					</div>
				</div>

				{isLoading && (
					<div className="absolute right-12 top-1/2 transform -translate-y-1/2">
						<Loader2 className="w-4 h-4 animate-spin text-gray-400" />
					</div>
				)}
			</div>

			{/* Dropdown */}
			{isOpen && places.length > 0 && (
				<div
					ref={dropdownRef}
					className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
					{places.map((place, index) => (
						<button
							key={place.place_id}
							type="button"
							onClick={() => handlePlaceSelect(place)}
							className={cn(
								"w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0",
								selectedIndex === index && "bg-purple-50 hover:bg-purple-50"
							)}>
							<div className="flex items-start gap-3">
								<MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium text-gray-900 truncate">
										{place.name || OpenMapAPI.formatPlaceDisplayName(place)}
									</div>
									<div className="text-xs text-gray-500 truncate mt-1">
										{place.display_name}
									</div>
									<div className="text-xs text-gray-400 mt-1">
										{parseFloat(place.lat).toFixed(4)},{" "}
										{parseFloat(place.lon).toFixed(4)}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>
			)}

			{/* No results message */}
			{isOpen && places.length === 0 && query.length >= 2 && !isLoading && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
					<div className="text-sm text-gray-500 text-center">
						No places found for "{query}"
					</div>
				</div>
			)}
		</div>
	);
};

export default PlaceSelector;
