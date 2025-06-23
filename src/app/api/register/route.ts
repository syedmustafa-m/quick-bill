import { NextResponse } from "next/server";
import { userService } from "@/lib/database";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing name, email, or password" },
        { status: 400 }
      );
    }

    const existingUser = await userService.getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await userService.createUser(email, password, name);
    
    // Update user with verification token
    const user = await userService.getUserByEmail(email);
    if (user) {
      await userService.updateUser(user.id, { verification_token: verificationToken });
    }

    // Extract first name for email personalization
    const firstName = name.split(' ')[0];
    await sendVerificationEmail(email, verificationToken, firstName);

    return NextResponse.json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
} 