import { NextResponse } from "next/server";
import { invoiceService } from "@/lib/database";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

async function getNextInvoiceNumber(userId: string): Promise<string> {
  const invoices = await invoiceService.getInvoicesByUserId(userId);

  if (invoices.length === 0) {
    return 'INV-00001';
  }

  const lastInvoice = invoices[0]; // Already sorted by created_at desc
  const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[1]);
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
    const itemsWithTotals = items.map((item: { description: string; quantity: number; unitPrice: number; }) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));

    const amount = itemsWithTotals.reduce((sum: number, item: { total: number; }) => sum + item.total, 0);
    const invoiceNumber = await getNextInvoiceNumber(session.user.id);

    const newInvoice = await invoiceService.createInvoice({
      invoice_number: invoiceNumber,
      status: 'DRAFT',
      amount,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      notes,
      client_id: clientId,
    }, itemsWithTotals);

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("CREATE_INVOICE_ERROR", error);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 }
    );
  }
} 