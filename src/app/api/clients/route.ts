import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { companyName, contactName, email, phone, address, website, notes } = body;

    if (!companyName || !email) {
      return NextResponse.json(
        { message: "Company name and email are required" },
        { status: 400 }
      );
    }

    const newClient = await prisma.client.create({
      data: {
        userId: session.user.id,
        companyName,
        contactName,
        email,
        phone,
        address,
        website,
        notes,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("CREATE_CLIENT_ERROR", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
} 