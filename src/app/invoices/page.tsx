import InvoiceList from "./InvoiceList";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

async function getInvoices(userId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { client: { userId: userId } },
    include: {
      client: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
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