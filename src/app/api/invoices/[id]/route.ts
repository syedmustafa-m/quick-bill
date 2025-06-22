import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = params.id;

  try {
    // Check if the invoice belongs to a client of the logged-in user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        client: {
          userId: session.user.id,
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Use a transaction to delete invoice items and then the invoice
    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({
        where: {
          invoiceId: invoiceId,
        },
      }),
      prisma.invoice.delete({
        where: {
          id: invoiceId,
        },
      }),
    ]);

    return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
} 