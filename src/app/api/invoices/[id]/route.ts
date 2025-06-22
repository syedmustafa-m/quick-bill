import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Extract invoice ID from URL
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const invoiceId = segments[segments.length - 1];

  try {
    // Verify the invoice belongs to the user's client
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

    // Delete related items and then the invoice
    await prisma.$transaction([
      prisma.invoiceItem.deleteMany({ where: { invoiceId } }),
      prisma.invoice.delete({ where: { id: invoiceId } }),
    ]);

    return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
