import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { invoiceService, clientService } from "@/lib/database";
import InvoiceViewPage from "./InvoiceViewPage";
import Link from "next/link";
import type { Database } from "@/lib/supabase";

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type User = Database['public']['Tables']['users']['Row'];

type InvoiceDetails = Invoice & {
  client: Client & {
    user: User
  };
  items: InvoiceItem[];
};

async function getInvoice(invoiceId: string, userId: string): Promise<InvoiceDetails | null> {
  const invoice = await invoiceService.getInvoiceById(invoiceId);
  
  if (!invoice) return null;
  
  // Check if the user has permission to view this invoice
  // We need to verify that the client belongs to the user
  const client = await clientService.getClientById(invoice.client_id);
  if (!client || client.user_id !== userId) {
    return null;
  }
  
  return invoice as InvoiceDetails;
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const invoice = await getInvoice(id, session.user.id);

  if (!invoice) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Invoice not found</h1>
        <p>The invoice you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/invoices" className="mt-4 inline-block text-brand-blue hover:text-brand-blue/90">
          Back to Invoices
        </Link>
      </div>
    );
  }

  return <InvoiceViewPage invoice={invoice} />;
} 