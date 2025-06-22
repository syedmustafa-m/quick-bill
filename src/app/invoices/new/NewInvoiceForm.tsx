"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ErrorBox from "../../components/ErrorBox";
import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { Client } from '@prisma/client';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface NewInvoiceFormProps {
  clients: Client[];
}

export default function NewInvoiceForm({ clients }: NewInvoiceFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [clientId, setClientId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('DRAFT');

  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const handleItemChange = (index: number, field: keyof Omit<LineItem, 'total'>, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (typeof item[field] === 'number') {
        (item[field] as number) = Number(value) || 0;
    } else {
        (item[field] as string) = String(value);
    }
    
    item.total = item.quantity * item.unitPrice;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!clientId) {
      setError("Please select a client.");
      setIsSubmitting(false);
      return;
    }

    const itemsForApi = items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
    }));

    try {
      const res = await fetch('/api/invoices', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            clientId, 
            dueDate, 
            notes,
            status,
            items: itemsForApi 
        }),
      });

      if (res.ok) {
        router.push("/invoices");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create invoice.");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Invoice</h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the details to create and save a new invoice.
          </p>
        </div>
        <div>
          <Link href="/invoices" className="text-sm font-medium text-brand-blue hover:text-blue-500">
            &larr; Back to all invoices
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-8">
        {error && <ErrorBox message={error} />}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">Client</label>
                <select id="clientId" name="clientId" onChange={(e) => setClientId(e.target.value)} value={clientId} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="">Select a client</option>
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.companyName}</option>
                    ))}
                </select>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" name="dueDate" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
          
          {/* Items Table */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Invoice Items</h3>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-x-4 items-center">
                    <div className="col-span-5">
                         <input type="text" placeholder="Item Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-2">
                        <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-2">
                        <input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div className="col-span-2 text-right">
                        <p className="text-sm text-gray-600">${item.total.toFixed(2)}</p>
                    </div>
                    <div className="col-span-1 text-right">
                        <button type="button" onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500">
                            <XCircleIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-4 px-3 py-1.5 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              + Add Item
            </button>
          </div>

           {/* Notes and Status */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea name="notes" id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" name="status" onChange={(e) => setStatus(e.target.value)} value={status} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <option value="DRAFT">Draft</option>
                        <option value="SENT">Sent</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
           </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 