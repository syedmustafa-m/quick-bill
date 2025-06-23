import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { clientService, invoiceService } from "@/lib/database";

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract client ID from the URL
  const clientId = request.nextUrl.pathname.split("/").pop();

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is missing" }, { status: 400 });
  }

  try {
    const client = await clientService.getClientById(clientId);

    if (!client || client.user_id !== session.user.id) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const invoices = await invoiceService.getInvoicesByUserId(session.user.id);
    const clientInvoices = invoices.filter(invoice => invoice.client_id === clientId);

    if (clientInvoices.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete a client with existing invoices. Please delete the invoices first." },
        { status: 400 }
      );
    }

    await clientService.deleteClient(clientId);

    return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
