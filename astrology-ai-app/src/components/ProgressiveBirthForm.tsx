"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
	ChevronRight,
	ChevronLeft,
	MapPin,
	Clock,
	Calendar,
	User,
	CheckCircle,
	AlertCircle,
	Info,
} from "lucide-react";
import { trackAstrologyEvent } from "../lib/analytics";

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
	timeConfidence: "exact" | "approximate" | "unknown";
}

interface ProgressiveBirthFormProps {
	onSubmit: (details: BirthDetails) => void;
	onCancel?: () => void;
	initialData?: BirthDetails | null;
}

type FormStep = "basic" | "datetime" | "location" | "confidence";

const ProgressiveBirthForm: React.FC<ProgressiveBirthFormProps> = ({
	onSubmit,
	onCancel,
	initialData,
}) => {
	const [currentStep, setCurrentStep] = useState<FormStep>("basic");
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
			timeConfidence: "approximate",
		}
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isDetectingLocation, setIsDetectingLocation] = useState(false);
	const [formStartTime] = useState(Date.now());

	// Track form started on mount
	useEffect(() => {
		trackAstrologyEvent.formStarted();
	}, []);

	// Auto-detect timezone and location
	const handleCurrentLocation = async () => {
		setIsDetectingLocation(true);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					try {
						// Use a free geocoding service (nominatim)
						const response = await fetch(
							`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
						);
						const data = await response.json();
						const city =
							data.address?.city ||
							data.address?.town ||
							data.address?.village ||
							"";
						const state = data.address?.state || "";
						const country = data.address?.country || "";

						const location = [city, state, country].filter(Boolean).join(", ");
						setFormData((prev) => ({ ...prev, placeOfBirth: location }));
					} catch (error) {
						console.error("Geocoding error:", error);
					} finally {
						setIsDetectingLocation(false);
					}
				},
				(error) => {
					console.error("Location error:", error);
					setIsDetectingLocation(false);
				}
			);
		}
	};

	const handleNow = () => {
		const now = new Date();
		setFormData((prev) => ({
			...prev,
			day: now.getDate().toString().padStart(2, "0"),
			month: (now.getMonth() + 1).toString().padStart(2, "0"),
			year: now.getFullYear().toString(),
			hours: now.getHours().toString().padStart(2, "0"),
			minutes: now.getMinutes().toString().padStart(2, "0"),
			seconds: "00",
			timeConfidence: "exact",
		}));
	};

	const validateStep = (step: FormStep): boolean => {
		const newErrors: Record<string, string> = {};

		switch (step) {
			case "basic":
				if (!formData.name.trim()) newErrors.name = "Name is required";
				break;
			case "datetime":
				if (!formData.day || !formData.month || !formData.year) {
					newErrors.date = "Complete birth date is required";
				}
				if (!formData.hours || !formData.minutes) {
					newErrors.time = "Birth time is required (approximate is OK)";
				}
				break;
			case "location":
				if (!formData.placeOfBirth.trim()) {
					newErrors.place = "Place of birth is required";
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const nextStep = () => {
		if (validateStep(currentStep)) {
			const steps: FormStep[] = ["basic", "datetime", "location", "confidence"];
			const currentIndex = steps.indexOf(currentStep);
			if (currentIndex < steps.length - 1) {
				// Track step completion
				trackAstrologyEvent.formStepCompleted(currentStep);
				setCurrentStep(steps[currentIndex + 1]);
			}
		}
	};

	const prevStep = () => {
		const steps: FormStep[] = ["basic", "datetime", "location", "confidence"];
		const currentIndex = steps.indexOf(currentStep);
		if (currentIndex > 0) {
			setCurrentStep(steps[currentIndex - 1]);
		}
	};

	const handleSubmit = () => {
		if (validateStep(currentStep)) {
			const timeToComplete = Date.now() - formStartTime;
			trackAstrologyEvent.formCompleted(timeToComplete);
			onSubmit(formData);
		}
	};

	const getStepProgress = () => {
		const steps: FormStep[] = ["basic", "datetime", "location", "confidence"];
		const currentIndex = steps.indexOf(currentStep);
		return ((currentIndex + 1) / steps.length) * 100;
	};

	const renderStepContent = () => {
		switch (currentStep) {
			case "basic":
				return (
					<div className="space-y-6">
						<div className="text-center mb-6">
							<User className="w-12 h-12 mx-auto text-purple-400 mb-3" />
							<h2 className="text-xl font-bold text-white mb-2">
								Let's start with basics
							</h2>
							<p className="text-white/70 text-sm">Just your name and gender</p>
						</div>

						<div>
							<label className="block text-white font-medium text-sm mb-2">
								What should we call you?
							</label>
							<Input
								type="text"
								placeholder="Your name"
								value={formData.name}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, name: e.target.value }))
								}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg py-3"
								autoFocus
							/>
							{errors.name && (
								<p className="text-red-400 text-sm mt-1 flex items-center">
									<AlertCircle className="w-4 h-4 mr-1" />
									{errors.name}
								</p>
							)}
						</div>

						<div>
							<label className="block text-white font-medium text-sm mb-2">
								Gender
							</label>
							<div className="flex bg-white/90 rounded-xl p-1">
								<button
									type="button"
									onClick={() =>
										setFormData((prev) => ({ ...prev, gender: "male" }))
									}
									className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
										formData.gender === "male"
											? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
											: "text-gray-600 hover:text-gray-800"
									}`}>
									Male
								</button>
								<button
									type="button"
									onClick={() =>
										setFormData((prev) => ({ ...prev, gender: "female" }))
									}
									className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
										formData.gender === "female"
											? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
											: "text-gray-600 hover:text-gray-800"
									}`}>
									Female
								</button>
							</div>
						</div>
					</div>
				);

			case "datetime":
				return (
					<div className="space-y-6">
						<div className="text-center mb-6">
							<Calendar className="w-12 h-12 mx-auto text-purple-400 mb-3" />
							<h2 className="text-xl font-bold text-white mb-2">
								When were you born?
							</h2>
							<p className="text-white/70 text-sm">
								Date and time (approximate is fine)
							</p>
						</div>

						{/* Date */}
						<div>
							<label className="block text-white font-medium text-sm mb-2">
								Birth Date
							</label>
							<div className="grid grid-cols-3 gap-3">
								<div>
									<Input
										type="number"
										placeholder="DD"
										min="1"
										max="31"
										value={formData.day}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, day: e.target.value }))
										}
										className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
									/>
									<p className="text-white/50 text-xs mt-1 text-center">Day</p>
								</div>
								<div>
									<Input
										type="number"
										placeholder="MM"
										min="1"
										max="12"
										value={formData.month}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												month: e.target.value,
											}))
										}
										className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
									/>
									<p className="text-white/50 text-xs mt-1 text-center">
										Month
									</p>
								</div>
								<div>
									<Input
										type="number"
										placeholder="YYYY"
										min="1900"
										max="2100"
										value={formData.year}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, year: e.target.value }))
										}
										className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
									/>
									<p className="text-white/50 text-xs mt-1 text-center">Year</p>
								</div>
							</div>
							{errors.date && (
								<p className="text-red-400 text-sm mt-1 flex items-center">
									<AlertCircle className="w-4 h-4 mr-1" />
									{errors.date}
								</p>
							)}
						</div>

						{/* Time */}
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="text-white font-medium text-sm">
									Birth Time
								</label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleNow}
									className="text-xs bg-white/20 border-white/30 text-white hover:bg-white/30">
									<Clock className="w-3 h-3 mr-1" />
									Now
								</Button>
							</div>
							<div className="grid grid-cols-3 gap-3">
								<div>
									<Input
										type="number"
										placeholder="HH"
										min="0"
										max="23"
										value={formData.hours}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												hours: e.target.value,
											}))
										}
										className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
									/>
									<p className="text-white/50 text-xs mt-1 text-center">Hour</p>
								</div>
								<div>
									<Input
										type="number"
										placeholder="MM"
										min="0"
										max="59"
										value={formData.minutes}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												minutes: e.target.value,
											}))
										}
										className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
									/>
									<p className="text-white/50 text-xs mt-1 text-center">Min</p>
								</div>
								<div>
									<Input
										type="number"
										placeholder="SS"
										min="0"
										max="59"
										value={formData.seconds}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												seconds: e.target.value,
											}))
										}
										className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
									/>
									<p className="text-white/50 text-xs mt-1 text-center">Sec</p>
								</div>
							</div>
							{errors.time && (
								<p className="text-red-400 text-sm mt-1 flex items-center">
									<AlertCircle className="w-4 h-4 mr-1" />
									{errors.time}
								</p>
							)}
							<div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mt-3">
								<div className="flex items-start">
									<Info className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
									<p className="text-blue-200 text-xs">
										Don't know exact time? That's OK! Even approximate time
										helps create accurate predictions.
									</p>
								</div>
							</div>
						</div>
					</div>
				);

			case "location":
				return (
					<div className="space-y-6">
						<div className="text-center mb-6">
							<MapPin className="w-12 h-12 mx-auto text-purple-400 mb-3" />
							<h2 className="text-xl font-bold text-white mb-2">
								Where were you born?
							</h2>
							<p className="text-white/70 text-sm">City, state, country</p>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="text-white font-medium text-sm">
									Place of Birth
								</label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleCurrentLocation}
									disabled={isDetectingLocation}
									className="text-xs bg-white/20 border-white/30 text-white hover:bg-white/30 disabled:opacity-50">
									<MapPin className="w-3 h-3 mr-1" />
									{isDetectingLocation ? "Detecting..." : "Current"}
								</Button>
							</div>
							<Input
								type="text"
								placeholder="e.g., Mumbai, Maharashtra, India"
								value={formData.placeOfBirth}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										placeOfBirth: e.target.value,
									}))
								}
								className="bg-white/90 border-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg py-3"
							/>
							{errors.place && (
								<p className="text-red-400 text-sm mt-1 flex items-center">
									<AlertCircle className="w-4 h-4 mr-1" />
									{errors.place}
								</p>
							)}
							<div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mt-3">
								<div className="flex items-start">
									<CheckCircle className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
									<p className="text-green-200 text-xs">
										We'll automatically detect the correct timezone for accurate
										calculations.
									</p>
								</div>
							</div>
						</div>
					</div>
				);

			case "confidence":
				return (
					<div className="space-y-6">
						<div className="text-center mb-6">
							<CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-3" />
							<h2 className="text-xl font-bold text-white mb-2">
								How accurate is your birth time?
							</h2>
							<p className="text-white/70 text-sm">
								This helps us provide better predictions
							</p>
						</div>

						<div className="space-y-3">
							{[
								{
									value: "exact",
									label: "Exact time",
									description: "From birth certificate or hospital records",
									confidence: "95%",
								},
								{
									value: "approximate",
									label: "Approximate time",
									description: "Within 15-30 minutes, family memory",
									confidence: "80%",
								},
								{
									value: "unknown",
									label: "Unknown time",
									description: "Only birth date is known",
									confidence: "60%",
								},
							].map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() =>
										setFormData((prev) => ({
											...prev,
											timeConfidence: option.value as any,
										}))
									}
									className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
										formData.timeConfidence === option.value
											? "border-purple-400 bg-purple-500/20"
											: "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
									}`}>
									<div className="flex items-center justify-between mb-1">
										<h3 className="font-medium text-white">{option.label}</h3>
										<span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-1 rounded-full">
											{option.confidence} accuracy
										</span>
									</div>
									<p className="text-white/70 text-sm">{option.description}</p>
								</button>
							))}
						</div>

						<div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
							<h3 className="font-medium text-white mb-2">
								Ready to generate your chart!
							</h3>
							<div className="text-sm text-white/80 space-y-1">
								<p>• Name: {formData.name}</p>
								<p>
									• Born: {formData.day}/{formData.month}/{formData.year} at{" "}
									{formData.hours}:{formData.minutes}
								</p>
								<p>• Place: {formData.placeOfBirth}</p>
								<p>• Accuracy: {formData.timeConfidence}</p>
							</div>
						</div>
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">
				{/* Progress Bar */}
				<div className="mb-8">
					<div className="flex justify-between text-xs text-white/60 mb-2">
						<span>
							Step{" "}
							{["basic", "datetime", "location", "confidence"].indexOf(
								currentStep
							) + 1}{" "}
							of 4
						</span>
						<span>{Math.round(getStepProgress())}% complete</span>
					</div>
					<div className="w-full bg-white/20 rounded-full h-2">
						<div
							className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 ease-out"
							style={{ width: `${getStepProgress()}%` }}
						/>
					</div>
				</div>

				{/* Step Content */}
				<div className="min-h-[400px]">{renderStepContent()}</div>

				{/* Navigation Buttons */}
				<div className="flex justify-between pt-6 mt-6 border-t border-white/20">
					<Button
						type="button"
						variant="outline"
						onClick={currentStep === "basic" ? onCancel : prevStep}
						className="bg-white/10 border-white/30 text-white hover:bg-white/20">
						<ChevronLeft className="w-4 h-4 mr-1" />
						{currentStep === "basic" ? "Cancel" : "Back"}
					</Button>

					{currentStep === "confidence" ? (
						<Button
							type="button"
							onClick={handleSubmit}
							className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8">
							Generate Chart
							<CheckCircle className="w-4 h-4 ml-2" />
						</Button>
					) : (
						<Button
							type="button"
							onClick={nextStep}
							className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
							Continue
							<ChevronRight className="w-4 h-4 ml-1" />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProgressiveBirthForm;
