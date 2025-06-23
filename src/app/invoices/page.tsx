import InvoiceList from "./InvoiceList";
import { invoiceService } from "@/lib/database";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

async function getInvoices(userId: string) {
  const invoices = await invoiceService.getInvoicesByUserId(userId);
  return invoices;
}

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/auth/signin");
  }

  const invoices = await getInvoices(session.user.id);

  return <InvoiceList invoices={invoices} />;
} 