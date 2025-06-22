import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UsersIcon, DocumentTextIcon, BanknotesIcon } from "@heroicons/react/24/outline";
import { InvoiceStatus } from "@prisma/client";
import WorkReportChart from "./components/WorkReportChart";

async function getStats(userId: string) {
  const clientCount = await prisma.client.count({ where: { userId } });
  const invoiceCount = await prisma.invoice.count({ where: { client: { userId } } });
  const totalRevenue = await prisma.invoice.aggregate({
    where: {
      client: { userId },
      status: InvoiceStatus.PAID,
    },
    _sum: {
      amount: true,
    },
  });
  return {
    clientCount,
    invoiceCount,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/signin");
  }

  const stats = await getStats(session.user.id);

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={BanknotesIcon} />
        <StatCard title="Total Clients" value={stats.clientCount} icon={UsersIcon} />
        <StatCard title="Total Invoices" value={stats.invoiceCount} icon={DocumentTextIcon} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Work Report</h2>
          <div style={{ height: 300 }}>
            <WorkReportChart />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Clients</h2>
            <p className="text-gray-500">Client list coming soon.</p>
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
      <div className="bg-blue-100 p-4 rounded-full">
        <Icon className="h-7 w-7 text-brand-blue" />
      </div>
      <div className="ml-4">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
    </div>
  );
}
