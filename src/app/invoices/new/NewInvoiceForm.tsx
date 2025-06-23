"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { XCircleIcon, PlusIcon } from "@heroicons/react/24/solid";
import toast from 'react-hot-toast';
import type { Database } from '@/lib/supabase';
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Label from "@/app/components/ui/Label";
import Select from "@/app/components/ui/Select";
import Textarea from "@/app/components/ui/Textarea";

type Client = Database['public']['Tables']['clients']['Row'];

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface NewInvoiceFormProps {
  clients: Client[];
}

export default function NewInvoiceForm({ clients }: NewInvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [clientId, setClientId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('DRAFT');

  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (typeof item[field] === 'number') {
        (item[field] as number) = Number(value) || 0;
    } else {
        (item[field] as string) = String(value);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!clientId) {
      toast.error("Please select a client.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/invoices', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            clientId, 
            dueDate, 
            notes,
            status,
            items
        }),
      });

      if (res.ok) {
        toast.success('Invoice created successfully!');
        router.push("/invoices");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create invoice.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create New Invoice</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Fill out the details to create and save a new invoice.
          </p>
        </div>
        <div>
          <Button asChild variant="ghost">
            <Link href="/invoices">
              &larr; Back to all invoices
            </Link>
          </Button>
        </div>
      </div>
      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800">
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="clientId" required>Client</Label>
                <Select
                  id="clientId"
                  name="clientId"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClientId(e.target.value)}
                  value={clientId}
                  required
                >
                  <option value="" disabled>Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.company_name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Items Table */}
            <div>
              <Label>Invoice Items</Label>
              <div className="mt-2 space-y-4">
                <div className="hidden md:grid md:grid-cols-12 gap-x-4 px-4">
                  <div className="col-span-5 text-xs font-medium text-gray-500">DESCRIPTION</div>
                  <div className="col-span-2 text-xs font-medium text-gray-500">QTY</div>
                  <div className="col-span-2 text-xs font-medium text-gray-500">PRICE</div>
                  <div className="col-span-2 text-xs font-medium text-gray-500 text-right">TOTAL</div>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-x-4 gap-y-2 items-center p-4 rounded-lg border border-gray-200 dark:border-neutral-800">
                    <div className="col-span-12 md:col-span-5">
                      <Input
                        type="text"
                        placeholder="Item Description"
                        value={item.description}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, 'description', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, 'unitPrice', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <div className="col-span-1 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                        className="!p-2 text-gray-400 hover:text-red-500"
                      >
                        <XCircleIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addItem}
                className="mt-4"
                leftIcon={<PlusIcon className="h-4 w-4" />}
              >
                Add Item
              </Button>
            </div>

            {/* Notes and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  name="notes"
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                  placeholder="Any additional information for the client."
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  name="status"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                  value={status}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 p-8 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black/50">
             <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Grand Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${calculateGrandTotal().toFixed(2)}
                </p>
             </div>
             <div className="flex items-center gap-4">
              <Button type="button" variant="secondary" onClick={() => router.push('/invoices')}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Save Invoice
              </Button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
} 