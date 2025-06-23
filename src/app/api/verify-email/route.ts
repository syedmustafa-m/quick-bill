import { NextResponse } from "next/server";
import { userService } from "@/lib/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  try {
    const user = await userService.verifyEmail(token);

    if (!user) {
      return new NextResponse("Invalid token", { status: 400 });
    }

    // Redirect to a success page
    const redirectUrl = new URL("/auth/verified", request.url);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("VERIFICATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 