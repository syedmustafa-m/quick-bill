import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { BanknotesIcon, ClockIcon, UsersIcon } from "@heroicons/react/24/outline";
import StatCard from "@/app/components/StatCard";
import RecentActivity from "./components/RecentActivity";
import type { Database } from "@/lib/supabase";

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type InvoiceWithClient = Invoice & { client: Client | null };

async function getDashboardData(userId: string) {
  try {
    const [
      invoicesRes,
      clientsRes,
      recentInvoicesRes,
      recentClientsRes
    ] = await Promise.all([
      supabaseAdmin.from('invoices').select('*, client:clients(*)').eq('client.user_id', userId),
      supabaseAdmin.from('clients').select('*', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('invoices').select('*, client:clients(*)').eq('client.user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5)
    ]);

    const { data: invoicesData, error: invoicesError } = invoicesRes;
    const { count: clientCount, error: clientsError } = clientsRes;
    const { data: allInvoicesForActivity, error: allInvoicesError } = recentInvoicesRes;
    const { data: allClientsForActivity, error: allClientsError } = recentClientsRes;

    if (invoicesError || clientsError || allInvoicesError || allClientsError) {
      throw new Error('Failed to fetch dashboard data.');
    }

    const invoices: InvoiceWithClient[] = invoicesData || [];
    const now = new Date();
    
    const totalRevenue = invoices
      .filter(invoice => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    const overdueInvoices = invoices.filter(invoice => 
      invoice.status === 'SENT' && 
      invoice.due_date && 
      new Date(invoice.due_date) < now
    );

    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

    return {
      totalRevenue,
      overdueAmount,
      overdueCount: overdueInvoices.length,
      clientCount: clientCount || 0,
      recentInvoices: (allInvoicesForActivity || []) as InvoiceWithClient[],
      recentClients: allClientsForActivity || [],
    };
  } catch {
    // Silently handle error
    return {
      totalRevenue: 0,
      overdueAmount: 0,
      overdueCount: 0,
      clientCount: 0,
      recentInvoices: [],
      recentClients: [],
    };
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/auth/signin");
  }

  const {
    totalRevenue,
    overdueAmount,
    overdueCount,
    clientCount,
    recentInvoices,
    recentClients,
  } = await getDashboardData(session.user.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: (
        <div className="rounded-md bg-green-500/10 p-2 ring-1 ring-inset ring-green-500/20">
          <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
      )
    },
    {
      title: "Overdue",
      value: formatCurrency(overdueAmount),
      change: `${overdueCount} invoice${overdueCount !== 1 ? 's' : ''}`,
      changeType: 'decrease',
      icon: (
        <div className="rounded-md bg-red-500/10 p-2 ring-1 ring-inset ring-red-500/20">
          <ClockIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
      )
    },
    {
      title: "Total Clients",
      value: clientCount.toString(),
      icon: (
        <div className="rounded-md bg-blue-500/10 p-2 ring-1 ring-inset ring-blue-500/20">
          <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          A quick overview of your business.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            change={item.change}
            changeType={item.changeType as 'increase' | 'decrease' | undefined}
            icon={item.icon}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-black">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-neutral-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h2>
        </div>
        <div className="p-6">
          <RecentActivity
            recentInvoices={recentInvoices}
            recentClients={recentClients}
          />
        </div>
      </div>
    </div>
  );
}
