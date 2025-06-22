"use client";

import { useRef } from 'react';
import Link from 'next/link';
import { Client, Invoice, InvoiceItem, InvoiceStatus, User } from "@prisma/client";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

type InvoiceDetails = Invoice & {
  client: Client & {
    user: User
  };
  items: InvoiceItem[];
};

const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-700 text-gray-300",
  SENT: "bg-orange-900 text-orange-300",
  PAID: "bg-green-900 text-green-300",
  CANCELLED: "bg-red-900 text-red-300",
};

interface InvoiceViewPageProps {
  invoice: InvoiceDetails;
}

export default function InvoiceViewPage({ invoice }: InvoiceViewPageProps) {
  const invoiceRef = useRef(null);
  const { client, items } = invoice;
  const user = client.user;

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = invoiceRef.current;

      const opt = {
        margin:       0.5,
        filename:     `invoice-${invoice.invoiceNumber}.pdf`,
        image:        { type: 'png', quality: 1.0 },
        html2canvas:  { scale: 4, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Could not generate PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <Link href="/invoices" className="text-sm font-medium text-brand-blue hover:text-brand-blue/90">
                &larr; Back to all invoices
            </Link>
            <div className="flex items-center space-x-2">
                <button 
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                 <button className="px-4 py-2 text-sm font-medium text-white bg-brand-blue border border-transparent rounded-md shadow-sm hover:bg-brand-blue/90">
                    Print
                </button>
            </div>
        </div>

        <div ref={invoiceRef}>
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
                        <p className="text-gray-500">{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>

                {/* Client Info & Dates */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Bill To</h3>
                        <p className="text-lg font-medium text-gray-800">{client.companyName}</p>
                        <p className="text-gray-600">{client.contactName}</p>
                        <p className="text-gray-600">{client.email}</p>
                    </div>
                    <div className="text-right">
                        <dl className="grid grid-cols-2 gap-x-4">
                            <dt className="text-sm font-medium text-gray-500">Invoice Date</dt>
                            <dd className="text-sm text-gray-800">{new Date(invoice.createdAt).toLocaleDateString()}</dd>
                            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                            <dd className="text-sm text-gray-800">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</dd>
                        </dl>
                    </div>
                </div>

                {/* Items Table */}
                <table className="min-w-full divide-y divide-gray-200 mb-8">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{item.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">${item.unitPrice.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800 font-medium">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end mb-8">
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>${invoice.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (0%)</span>
                            <span>$0.00</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-lg">
                            <span>Total</span>
                            <span>${invoice.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                     <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Notes</h3>
                        <p className="text-sm text-gray-600">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
} 