"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Client } from '@prisma/client';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../components/ConfirmationModal';

interface ClientListProps {
    clients: Client[];
}

export default function ClientList({ clients: initialClients }: ClientListProps) {
    const [clients, setClients] = useState(initialClients);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<string | null>(null);

    const filteredClients = clients.filter(client => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return (
            client.companyName?.toLowerCase().includes(lowercasedFilter) ||
            client.contactName?.toLowerCase().includes(lowercasedFilter) ||
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
        } else {
            const { message } = await res.json();
            alert(`Error: ${message}`);
        }
        setIsModalOpen(false);
        setClientToDelete(null);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-72 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                    />
                </div>
                <Link href="/clients/new">
                    <span className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue">
                        Add New Client
                    </span>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto rounded-lg">
                {filteredClients.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map((client) => (
                        <tr key={client.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.companyName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.contactName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                <Link href={`/clients/edit/${client.id}`} className="text-brand-blue hover:text-brand-blue/90">Edit</Link>
                                <button 
                                    onClick={() => handleDelete(client.id)}
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
                    <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm 
                            ? `Your search for "${searchTerm}" did not match any clients.`
                            : "Get started by adding your first client."
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
                title="Delete Client"
                message="Are you sure you want to delete this client? This action cannot be undone."
            />
        </>
    );
} 