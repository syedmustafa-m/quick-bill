"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Invoice, Client, InvoiceStatus } from '@prisma/client';
import { TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

type InvoiceWithClient = Invoice & { client: Client };

interface InvoiceListProps {
    invoices: InvoiceWithClient[];
}

const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
    const statusStyles = {
      [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
      [InvoiceStatus.SENT]: 'bg-blue-100 text-brand-blue',
      [InvoiceStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [InvoiceStatus.CANCELLED]: 'bg-red-100 text-red-800',
    };
  
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
};

export default function InvoiceList({ invoices: initialInvoices }: InvoiceListProps) {
    const [invoices, setInvoices] = useState(initialInvoices);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

    const filteredInvoices = invoices.filter(invoice => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return (
            invoice.invoiceNumber.toLowerCase().includes(lowercasedFilter) ||
            invoice.client.companyName?.toLowerCase().includes(lowercasedFilter) ||
            invoice.status.toLowerCase().includes(lowercasedFilter)
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
        } else {
            const { message } = await res.json();
            alert(`Error: ${message}`);
        }
        setIsModalOpen(false);
        setInvoiceToDelete(null);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <input 
                        type="text" 
                        placeholder="Search by number, client, or status..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-72 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                    />
                </div>
                <Link href="/invoices/new">
                    <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                        Create New Invoice
                    </span>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto rounded-lg">
                {filteredInvoices.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInvoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.client.companyName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${invoice.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={invoice.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <Link href={`/invoices/${invoice.id}`} className="text-brand-blue hover:text-brand-blue/90">
                                        View
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(invoice.id)} 
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-16 px-4">
                        <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm 
                                ? `Your search for "${searchTerm}" did not match any invoices.`
                                : "Create your first invoice to get started."
                            }
                        </p>
                    </div>
                )}
                </div>
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
            />
        </>
    );
} 