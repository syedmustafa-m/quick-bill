import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client, Invoice, InvoiceItem, User } from "@prisma/client";
import InvoiceViewPage from "./InvoiceViewPage";
import Link from "next/link";

type InvoiceDetails = Invoice & {
  client: Client & {
    user: User
  };
  items: InvoiceItem[];
};

async function getInvoice(invoiceId: string, userId: string): Promise<InvoiceDetails | null> {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
      client: {
        userId: userId,
      }
    },
    include: {
      client: {
        include: {
          user: true,
        },
      },
      items: true,
    },
  });
  
  return invoice as InvoiceDetails | null;
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