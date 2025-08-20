"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Settings, MapPin, Clock } from "lucide-react";

interface BirthDetails {
	name: string;
	gender: "male" | "female";
	day: string;
	month: string;
	year: string;
	hours: string;
	minutes: string;
	seconds: string;
	placeOfBirth: string;
}

interface BirthDetailsFormProps {
	onSubmit: (details: BirthDetails) => void;
	onCancel?: () => void;
	initialData?: BirthDetails | null;
}

const BirthDetailsForm: React.FC<BirthDetailsFormProps> = ({
	onSubmit,
	onCancel,
	initialData,
}) => {
	const [formData, setFormData] = useState<BirthDetails>(
		initialData || {
			name: "",
			gender: "male",
			day: "",
			month: "",
			year: "",
			hours: "",
			minutes: "",
			seconds: "",
			placeOfBirth: "",
		}
	);

	// Update form data when initialData changes
	useEffect(() => {
		if (initialData) {
			setFormData(initialData);
		}
	}, [initialData]);

	const handleInputChange = (field: keyof BirthDetails, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleGenderChange = (gender: "male" | "female") => {
		setFormData((prev) => ({ ...prev, gender }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	const handleCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					// You can implement reverse geocoding here to get the place name
					console.log("Current location:", position.coords);
				},
				(error) => {
					console.error("Error getting location:", error);
				}
			);
		}
	};

	const handleNow = () => {
		const now = new Date();
		setFormData((prev) => ({
			...prev,
			day: now.getDate().toString(),
			month: (now.getMonth() + 1).toString(),
			year: now.getFullYear().toString(),
			hours: now.getHours().toString().padStart(2, "0"),
			minutes: now.getMinutes().toString().padStart(2, "0"),
			seconds: now.getSeconds().toString().padStart(2, "0"),
		}));
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">
				<form
					onSubmit={handleSubmit}
					className="space-y-6">
					{/* Name Field */}
					<div>
						<label className="block text-white font-bold text-sm mb-2">
							Name
						</label>
						<Input
							type="text"
							placeholder="Name"
							value={formData.name}
							onChange={(e) => handleInputChange("name", e.target.value)}
							className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						/>
					</div>

					{/* Gender Selection */}
					<div>
						<label className="block text-white font-bold text-sm mb-2">
							Gender
						</label>
						<div className="flex bg-white/90 rounded-xl p-1">
							<button
								type="button"
								onClick={() => handleGenderChange("male")}
								className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
									formData.gender === "male"
										? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
										: "text-gray-600 hover:text-gray-800"
								}`}>
								Male
							</button>
							<button
								type="button"
								onClick={() => handleGenderChange("female")}
								className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
									formData.gender === "female"
										? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
										: "text-gray-600 hover:text-gray-800"
								}`}>
								Female
							</button>
						</div>
					</div>

					{/* Date of Birth */}
					<div className="grid grid-cols-3 gap-3">
						<div>
							<label className="block text-white font-bold text-sm mb-2">
								Day
							</label>
							<Input
								type="number"
								placeholder="Day"
								min="1"
								max="31"
								value={formData.day}
								onChange={(e) => handleInputChange("day", e.target.value)}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-white font-bold text-sm mb-2">
								Month
							</label>
							<Input
								type="number"
								placeholder="Month"
								min="1"
								max="12"
								value={formData.month}
								onChange={(e) => handleInputChange("month", e.target.value)}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-white font-bold text-sm mb-2">
								Year
							</label>
							<Input
								type="number"
								placeholder="Year"
								min="1900"
								max="2100"
								value={formData.year}
								onChange={(e) => handleInputChange("year", e.target.value)}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Time of Birth */}
					<div className="grid grid-cols-3 gap-3">
						<div>
							<label className="block text-white font-bold text-sm mb-2">
								Hrs
							</label>
							<Input
								type="number"
								placeholder="Hours"
								min="0"
								max="23"
								value={formData.hours}
								onChange={(e) => handleInputChange("hours", e.target.value)}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-white font-bold text-sm mb-2">
								Min
							</label>
							<Input
								type="number"
								placeholder="Minute"
								min="0"
								max="59"
								value={formData.minutes}
								onChange={(e) => handleInputChange("minutes", e.target.value)}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label className="block text-white font-bold text-sm mb-2">
								Sec
							</label>
							<Input
								type="number"
								placeholder="Second"
								min="0"
								max="59"
								value={formData.seconds}
								onChange={(e) => handleInputChange("seconds", e.target.value)}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
					</div>

					{/* Place of Birth */}
					<div>
						<label className="block text-white font-bold text-sm mb-2">
							Place of Birth
						</label>
						<Input
							type="text"
							placeholder="Place of Birth"
							value={formData.placeOfBirth}
							onChange={(e) =>
								handleInputChange("placeOfBirth", e.target.value)
							}
							className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="flex-1 bg-white/90 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600">
							<Settings className="w-4 h-4 mr-2" />
							SETTINGS
						</Button>
						<div className="flex gap-2 flex-1">
							<Button
								type="button"
								variant="outline"
								onClick={handleCurrentLocation}
								className="flex-1 bg-white/90 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600">
								<MapPin className="w-4 h-4 mr-2" />
								CURRENT LOCATION
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={handleNow}
								className="flex-1 bg-white/90 border-red-500 text-red-600 hover:bg-red-50 hover:border-red-600">
								<Clock className="w-4 h-4 mr-2" />
								NOW
							</Button>
						</div>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						variant="cosmic"
						size="lg"
						className="w-full mt-6">
						Generate Birth Chart
					</Button>
				</form>
			</div>
		</div>
	);
};

export default BirthDetailsForm;
