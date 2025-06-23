"use client";

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase';

type Client = Database['public']['Tables']['clients']['Row'];

interface ClientListProps {
    clients: Client[];
}

export default function ClientList({ clients: initialClients }: ClientListProps) {
    const [clients, setClients] = useState(initialClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);

    const filteredClients = clients.filter(client => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return (
            client.company_name?.toLowerCase().includes(lowercasedFilter) ||
            client.contact_name?.toLowerCase().includes(lowercasedFilter) ||
            client.email.toLowerCase().includes(lowercasedFilter)
        );
    });

    const handleDelete = (id: string) => {
        setClientToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;

        const res = await fetch(`/api/clients/${clientToDelete}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setClients(clients.filter((client) => client.id !== clientToDelete));
            toast.success('Client deleted successfully');
        } else {
            const { message } = await res.json();
            toast.error(`Error: ${message}`);
        }
        setIsModalOpen(false);
        setClientToDelete(null);
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Clients</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your client relationships and information.
                    </p>
                </div>
                <Link 
                    href="/clients/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-start to-brand-end px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-start focus:ring-offset-2 transition"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Client
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search clients..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-start focus:outline-none focus:ring-1 focus:ring-brand-start dark:border-neutral-700 dark:bg-black dark:text-gray-100 dark:placeholder-gray-400"
                    />
                </div>
            </div>

            {/* Clients Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-black">
                {filteredClients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                            <thead className="bg-gray-50 dark:bg-neutral-900">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Company Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Contact
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                        Added On
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-800 dark:bg-black">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.company_name}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{client.contact_name}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-100">{client.email}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(client.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-4">
                                                <Link 
                                                    href={`/clients/edit/${client.id}`} 
                                                    className="text-brand-start hover:text-brand-end transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(client.id)}
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No clients found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm 
                                ? `Your search for "${searchTerm}" did not match any clients.`
                                : "Get started by adding your first client."
                            }
                        </p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <Link 
                                    href="/clients/new"
                                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-start to-brand-end px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-start focus:ring-offset-2 transition"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Add Client
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
                title="Delete Client"
                message="Are you sure you want to delete this client? This action cannot be undone."
            />
        </div>
    );
} 