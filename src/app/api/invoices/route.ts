import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getNextInvoiceNumber(userId: string): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { client: { userId } },
    orderBy: { createdAt: 'desc' },
  });

  if (!lastInvoice) {
    return 'INV-00001';
  }

  const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
  const nextNumber = lastNumber + 1;
  return `INV-${String(nextNumber).padStart(5, '0')}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clientId, dueDate, notes, items } = body;

    if (!clientId || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Client and at least one item are required" },
        { status: 400 }
      );
    }

    // Calculate totals for each item and overall amount
    const itemsWithTotals = items.map((item: any) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));

    const amount = itemsWithTotals.reduce((sum: number, item: any) => sum + item.total, 0);
    const invoiceNumber = await getNextInvoiceNumber(session.user.id);

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: 'DRAFT',
        amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        client: { connect: { id: clientId } },
        items: {
          create: itemsWithTotals,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("CREATE_INVOICE_ERROR", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
} 