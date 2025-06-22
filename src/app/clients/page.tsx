import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientList from "./ClientList";

async function getClients(userId: string) {
  const clients = await prisma.client.findMany({
    where: { userId },
    orderBy: { companyName: "asc" },
  });
  return clients;
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/signin");
  }

  const clients = await getClients(session.user.id);

  return <ClientList clients={clients} />;
} 