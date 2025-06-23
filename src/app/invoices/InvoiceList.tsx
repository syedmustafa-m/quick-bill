"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];

interface InvoiceWithClient extends Invoice {
    client: Client;
}

interface InvoiceListProps {
    invoices: InvoiceWithClient[];
}

export default function InvoiceList({ invoices: initialInvoices }: InvoiceListProps) {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

    const filteredInvoices = invoices.filter(invoice => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return (
            invoice.invoice_number.toLowerCase().includes(lowercasedFilter) ||
            invoice.client.company_name?.toLowerCase().includes(lowercasedFilter) ||
            invoice.client.contact_name?.toLowerCase().includes(lowercasedFilter)
        );
    });

    const handleDelete = (id: string) => {
        setInvoiceToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!invoiceToDelete) return;

        const res = await fetch(`/api/invoices/${invoiceToDelete}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setInvoices(invoices.filter((invoice) => invoice.id !== invoiceToDelete));
            toast.success('Invoice deleted successfully');
        } else {
            const { message } = await res.json();
            toast.error(`Error: ${message}`);
        }
        setIsModalOpen(false);
        setInvoiceToDelete(null);
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
        
        switch (status) {
            case 'DRAFT':
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-300`;
            case 'SENT':
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
            case 'PAID':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
            case 'OVERDUE':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-300`;
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Invoices</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage and track your invoices.
                    </p>
                </div>
                <Link 
                    href="/invoices/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-start to-brand-end px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-start focus:ring-offset-2 transition"
                >
                    <PlusIcon className="h-4 w-4" />
                    Create Invoice
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search invoices..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-start focus:outline-none focus:ring-1 focus:ring-brand-start dark:border-neutral-700 dark:bg-black dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-black">
                {filteredInvoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                            <thead className="bg-gray-50 dark:bg-neutral-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Invoice #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Client
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Amount
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Due Date
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-800 dark:bg-black">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.invoice_number}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{invoice.client.company_name}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">${invoice.amount.toFixed(2)}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={getStatusBadge(invoice.status)}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-4">
                                                <Link 
                                                    href={`/invoices/${invoice.id}`} 
                                                    className="text-brand-start hover:text-brand-end transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <Link 
                                                    href={`/invoices/edit/${invoice.id}`} 
                                                    className="text-brand-start hover:text-brand-end transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-12 w-12">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No invoices found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm 
                                ? `Your search for "${searchTerm}" did not match any invoices.`
                                : "Get started by creating your first invoice."
                            }
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <Link 
                                    href="/invoices/new"
                                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-start to-brand-end px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-start focus:ring-offset-2 transition"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Create Invoice
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
            />
        </div>
    );
} 