import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      return new NextResponse("Invalid token", { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Clear the token
      },
    });

    // Redirect to a success page
    const redirectUrl = new URL("/auth/verified", request.url);
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("VERIFICATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 