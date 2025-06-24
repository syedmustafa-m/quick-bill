"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { 
  DocumentArrowDownIcon, 
  PaperAirplaneIcon, 
  PencilIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { Database } from '@/lib/supabase';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];

interface InvoiceWithDetails extends Invoice {
  client: Client;
  items: InvoiceItem[];
}

interface InvoiceViewPageProps {
  invoice: InvoiceWithDetails;
}

export default function InvoiceViewPage({ invoice: initialInvoice }: InvoiceViewPageProps) {
    const [invoice, setInvoice] = useState(initialInvoice);
    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);
    
    // Fetch company logo
    useEffect(() => {
        const fetchCompanyLogo = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const userData = await res.json();
                    if (userData.company_logo_url) {
                        setCompanyLogo(userData.company_logo_url);
                    }
                }
            } catch {
                // Silently handle error
            }
        };

        fetchCompanyLogo();
    }, []);

    const handleStatusChange = async (newStatus: string) => {
        const res = await fetch(`/api/invoices/${invoice.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });

        if (res.ok) {
            const updatedInvoice = await res.json();
            setInvoice(updatedInvoice);
            toast.success(`Invoice status updated to ${newStatus}`);
        } else {
            toast.error('Failed to update status');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            
            const element = invoiceRef.current;
            if (!element) return;

            const opt = {
                margin: 0.5,
                filename: `invoice-${invoice.invoice_number}.pdf`,
                image: { type: 'png', quality: 1.0 },
                html2canvas: { scale: 4, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().from(element).set(opt).save();

        } catch {
            toast.error('Could not generate PDF. Please try again.');
        }
    };

    const handleSendInvoice = async () => {
        if (!invoice.client?.email) {
            toast.error('Client email is required to send invoice');
            return;
        }

        setIsSending(true);
        const toastId = toast.loading('Generating PDF and sending email to client...');

        try {
            // 1. Generate PDF as Blob using html2pdf.js
            const html2pdf = (await import('html2pdf.js')).default;
            const element = invoiceRef.current;
            if (!element) throw new Error('Invoice element not found');

            const opt = {
                margin: 0.5,
                filename: `invoice-${invoice.invoice_number}.pdf`,
                image: { type: 'png', quality: 1.0 },
                html2canvas: { scale: 4, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            // Generate PDF as Blob
            const pdfBlob: Blob = await new Promise((resolve, reject) => {
                html2pdf().from(element).set(opt).outputPdf('blob').then(resolve).catch(reject);
            });

            // 2. Get signed upload URL from server
            const filename = `invoice-${invoice.invoice_number}-${Date.now()}.pdf`;
            const signedUrlRes = await fetch('/api/profile/signed-upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, folder: 'invoice-attachments' })
            });
            if (!signedUrlRes.ok) throw new Error('Failed to get signed upload URL');
            const { signedUrl, path } = await signedUrlRes.json();

            // 3. Upload PDF Blob to Supabase
            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/pdf' },
                body: pdfBlob
            });
            if (!uploadRes.ok) throw new Error('Failed to upload PDF to Supabase');

            // 4. Call send-invoice API with file path
            const res = await fetch(`/api/invoices/${invoice.id}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfPath: path })
            });

            if (res.ok) {
                setInvoice(prev => ({ ...prev, status: 'SENT' }));
                toast.success('Invoice sent successfully! Email with PDF attachment delivered to client.', { id: toastId });
            } else {
                const error = await res.json();
                toast.error(error.message || 'Failed to send invoice', { id: toastId });
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send invoice';
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSending(false);
        }
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
    
    const subtotal = (invoice.items || []).reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const tax = subtotal * 0.1; // Example 10% tax
    const total = subtotal + tax;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Invoice #{invoice.invoice_number}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Invoice details and status.
                    </p>
                </div>
                <div>
                    <Link href="/invoices" className="text-sm font-medium text-brand-start hover:text-brand-end">
                        &larr; Back to all invoices
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800">
                <div ref={invoiceRef} className="p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            {companyLogo ? (
                                <div className="h-12 w-32 relative mb-2">
                                    <Image
                                        src={companyLogo}
                                        alt="Company Logo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            ) : (
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">InvGen</h2>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                123 Main St, Anytown, USA
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Invoice</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">#{invoice.invoice_number}</p>
                            <div className="mt-2">
                                <span className={getStatusBadge(invoice.status)}>
                                    {invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Bill To</h3>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.client?.company_name || 'N/A'}</p>
                            <p className="text-gray-600 dark:text-gray-300">{invoice.client?.contact_name || 'N/A'}</p>
                            <p className="text-gray-600 dark:text-gray-300">{invoice.client?.email || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Details</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Issue Date:</span> {new Date(invoice.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Due Date:</span> {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flow-root">
                        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                {!invoice.items || invoice.items.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">No items found for this invoice.</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-300 dark:divide-neutral-700">
                                        <thead className="text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-0">Description</th>
                                                <th scope="col" className="px-3 py-3.5">Quantity</th>
                                                <th scope="col" className="px-3 py-3.5">Unit Price</th>
                                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-neutral-800 text-sm text-gray-600 dark:text-gray-300">
                                            {(invoice.items || []).map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-4 pl-4 pr-3 sm:pl-0">{item.description}</td>
                                                    <td className="px-3 py-4">{item.quantity}</td>
                                                    <td className="px-3 py-4">${item.unit_price.toFixed(2)}</td>
                                                    <td className="relative py-4 pl-3 pr-4 text-right sm:pr-0">
                                                        ${(item.quantity * item.unit_price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th scope="row" colSpan={3} className="pt-4 pl-4 pr-3 text-right font-normal sm:pl-0">Subtotal</th>
                                                <td className="pt-4 pl-3 pr-4 text-right sm:pr-0">${subtotal.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" colSpan={3} className="pt-2 pl-4 pr-3 text-right font-normal sm:pl-0">Tax (10%)</th>
                                                <td className="pt-2 pl-3 pr-4 text-right sm:pr-0">${tax.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" colSpan={3} className="pt-2 pl-4 pr-3 text-right font-bold sm:pl-0">Total</th>
                                                <td className="pt-2 pl-3 pr-4 text-right font-bold sm:pr-0">${total.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {invoice.notes && (
                         <div className="mt-8 border-t border-gray-200 dark:border-neutral-800 pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Notes</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{invoice.notes}</p>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-neutral-800 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-neutral-900/50 dark:to-neutral-800/50 px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleStatusChange('PAID')} 
                                    disabled={invoice.status === 'PAID'}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Mark as Paid
                                </button>
                                <button 
                                    onClick={() => handleStatusChange('SENT')} 
                                    disabled={invoice.status === 'SENT' || invoice.status === 'PAID'}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ClockIcon className="h-4 w-4" />
                                    Mark as Sent
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleDownloadPDF}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-black dark:text-gray-300 dark:border-neutral-700 dark:hover:bg-neutral-900 transition-all duration-200"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4" />
                                Download PDF
                            </button>
                            
                            <button 
                                onClick={handleSendInvoice}
                                disabled={isSending || !invoice.client?.email || invoice.status === 'PAID'}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-brand-start to-brand-end border border-transparent rounded-lg shadow-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <PaperAirplaneIcon className="h-4 w-4" />
                                {isSending ? 'Sending...' : 'Send Invoice'}
                            </button>
                            
                            <Link 
                                href={`/invoices/edit/${invoice.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-black dark:text-gray-300 dark:border-neutral-700 dark:hover:bg-neutral-900 transition-all duration-200"
                            >
                                <PencilIcon className="h-4 w-4" />
                                Edit Invoice
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 