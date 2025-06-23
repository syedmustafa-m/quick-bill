"use client";

import Link from 'next/link';
import { DocumentTextIcon, UserGroupIcon, CalendarIcon } from '@heroicons/react/24/outline';
import type { Database } from '@/lib/supabase';
import Button from './ui/Button';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type InvoiceWithClient = Invoice & { client: Client | null };

interface RecentActivityProps {
  recentInvoices: InvoiceWithClient[];
  recentClients: Client[];
}

export default function RecentActivity({ recentInvoices, recentClients }: RecentActivityProps) {
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
    
    switch (status) {
      case 'DRAFT':
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
      case 'SENT':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
      case 'PAID':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Today';
    if (diffDays <= 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (recentInvoices.length === 0 && recentClients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <DocumentTextIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">No recent activity</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating your first invoice or adding a client.
        </p>
        <div className="mt-6 flex items-center justify-center gap-x-3">
          <Button asChild>
            <Link href="/invoices/new">Create Invoice</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/clients/new">Add Client</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-my-4 divide-y divide-gray-200 dark:divide-gray-700">
        {[...recentInvoices, ...recentClients]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((item) => {
            const isInvoice = 'invoice_number' in item;
            if (isInvoice) {
              const invoice = item as InvoiceWithClient;
              return (
                <li key={`invoice-${invoice.id}`} className="relative py-4">
                  <Link href={`/invoices/${invoice.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 -m-3 p-3 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                          <DocumentTextIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          Invoice {invoice.invoice_number}
                        </p>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          To {invoice.client?.company_name || 'N/A'}
                        </p>
                      </div>
                      <div className="flex-shrink-0 self-start text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatAmount(invoice.amount)}
                        </div>
                        <div className={getStatusBadge(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            } else {
              const client = item as Client;
              return (
                <li key={`client-${client.id}`} className="relative py-4">
                  <Link href={`/clients/${client.id}/edit`} className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 -m-3 p-3 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                          <UserGroupIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          New Client: {client.company_name}
                        </p>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {client.email}
                        </p>
                      </div>
                      <div className="flex-shrink-0 self-start text-right text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(client.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            }
          })}
      </ul>

      <div className="mt-6">
        <Button asChild variant="outline" className="w-full">
          <Link href="/invoices">View all activity</Link>
        </Button>
      </div>
    </div>
  );
} 