import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract clientId from URL
  const url = new URL(request.url);
  const pathnameParts = url.pathname.split('/');
  const clientId = pathnameParts[pathnameParts.length - 1];

  try {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: session.user.id,
      },
      include: {
        invoices: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (client.invoices.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete a client with existing invoices. Please delete the invoices first." },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: {
        id: clientId,
      },
    });

    return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
