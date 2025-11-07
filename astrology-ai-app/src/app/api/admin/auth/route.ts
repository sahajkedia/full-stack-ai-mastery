import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();

		if (!username || !password) {
			return NextResponse.json(
				{
					success: false,
					error: "Username and password are required",
				},
				{ status: 400 }
			);
		}

		const isValid = await verifyAdminCredentials(username, password);

		if (isValid) {
			// Generate a simple token (in production, use JWT)
			const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

			return NextResponse.json({
				success: true,
				token,
				message: "Login successful",
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid credentials",
				},
				{ status: 401 }
			);
		}
	} catch (error) {
		console.error("Admin auth error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
