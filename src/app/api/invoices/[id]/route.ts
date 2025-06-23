import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { invoiceService } from "@/lib/database";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = request.nextUrl.pathname.split("/").pop();

  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, ...otherUpdates } = body;

    const invoice = await invoiceService.getInvoiceById(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const userInvoices = await invoiceService.getInvoicesByUserId(session.user.id);
    const userInvoiceIds = userInvoices.map(inv => inv.id);

    if (!userInvoiceIds.includes(invoiceId)) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updatedInvoice = await invoiceService.updateInvoice(invoiceId, {
      status,
      ...otherUpdates
    });

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoiceId = request.nextUrl.pathname.split("/").pop();

  if (!invoiceId) {
    return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
  }

  try {
    const invoice = await invoiceService.getInvoiceById(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const userInvoices = await invoiceService.getInvoicesByUserId(session.user.id);
    const userInvoiceIds = userInvoices.map(inv => inv.id);

    if (!userInvoiceIds.includes(invoiceId)) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await invoiceService.deleteInvoice(invoiceId);

    return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
