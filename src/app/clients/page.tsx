import { clientService } from "@/lib/database";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientList from "./ClientList";

async function getClients(userId: string) {
  const clients = await clientService.getClientsByUserId(userId);
  return clients.sort((a, b) => a.company_name.localeCompare(b.company_name));
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/signin");
  }

  const clients = await getClients(session.user.id);

  return <ClientList clients={clients} />;
} 