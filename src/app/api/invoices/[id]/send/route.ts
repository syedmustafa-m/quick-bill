import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { invoiceService, userService } from "@/lib/database";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInvoiceEmail } from "@/lib/email";
import puppeteer from "puppeteer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const invoice = await invoiceService.getInvoiceById(id);

    if (!invoice || invoice.client.user_id !== session.user.id) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Get user profile for company logo
    const userProfile = await userService.getUserById(session.user.id);
    const companyLogo = userProfile?.company_logo_url;
    
    // Get brand theme colors based on user's selected theme
    let brandTheme: { primary: string; secondary: string } | undefined = undefined;
    if (userProfile?.brand_theme) {
      const colorThemes = [
        { id: 'professional-blue', primary: '#2563eb', secondary: '#1e40af' },
        { id: 'modern-orange', primary: '#f97316', secondary: '#ea580c' },
        { id: 'elegant-purple', primary: '#7c3aed', secondary: '#6d28d9' },
        { id: 'nature-green', primary: '#16a34a', secondary: '#15803d' },
        { id: 'bold-red', primary: '#dc2626', secondary: '#b91c1c' },
        { id: 'minimal-gray', primary: '#6b7280', secondary: '#4b5563' }
      ];
      const foundTheme = colorThemes.find(theme => theme.id === userProfile.brand_theme);
      if (foundTheme) {
        brandTheme = { primary: foundTheme.primary, secondary: foundTheme.secondary };
      }
    }

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Create HTML content for the invoice
    const primaryColor = brandTheme?.primary || '#f97316';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice #${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
            .logo-section { display: flex; align-items: center; }
            .logo-image { max-height: 60px; max-width: 200px; object-fit: contain; }
            .logo-text { font-size: 24px; font-weight: bold; color: ${primaryColor}; margin-left: 10px; }
            .invoice-info { text-align: right; }
            .invoice-info h2 { margin: 0 0 8px 0; font-size: 20px; }
            .invoice-info p { margin: 4px 0; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
            .status-draft { background: #f3f4f6; color: #374151; }
            .status-sent { background: #dbeafe; color: #1d4ed8; }
            .status-paid { background: #dcfce7; color: #15803d; }
            .status-overdue { background: #fee2e2; color: #dc2626; }
            .billing-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .billing-info h3 { font-size: 14px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; }
            .billing-info p { margin: 4px 0; }
            .details-section { text-align: right; }
            .details-section h3 { font-size: 14px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; }
            .details-section p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: 600; }
            .total-row { font-weight: bold; }
            .notes { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" class="logo-image">` : ''}
              <div class="logo-text">${companyLogo ? '' : 'InvGen'}</div>
            </div>
            <div class="invoice-info">
              <h2>Invoice</h2>
              <p>#${invoice.invoice_number}</p>
              <span class="status status-${invoice.status.toLowerCase()}">${invoice.status}</span>
            </div>
          </div>
          
          <div class="billing-section">
            <div class="billing-info">
              <h3>Bill To</h3>
              <p><strong>${invoice.client.company_name}</strong></p>
              <p>${invoice.client.contact_name || ''}</p>
              <p>${invoice.client.email}</p>
            </div>
            <div class="details-section">
              <h3>Details</h3>
              <p><strong>Issue Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item: { description: string; quantity: number; unit_price: number }) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unit_price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Subtotal</strong></td>
                <td>$${invoice.items.reduce((acc: number, item: { quantity: number; unit_price: number }) => acc + (item.quantity * item.unit_price), 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Tax (10%)</strong></td>
                <td>$${(invoice.items.reduce((acc: number, item: { quantity: number; unit_price: number }) => acc + (item.quantity * item.unit_price), 0) * 0.1).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>Total</strong></td>
                <td>$${invoice.amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          ${invoice.notes ? `
            <div class="notes">
              <h3>Notes</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    });
    
    await browser.close();

    // Convert Uint8Array to Buffer for email attachment
    const pdfBufferForEmail = Buffer.from(pdfBuffer);

    // Upload PDF to Supabase Storage
    const fileName = `invoice-${invoice.invoice_number}-${Date.now()}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('invoice-attachments')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      throw new Error('Failed to upload PDF');
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('invoice-attachments')
      .getPublicUrl(fileName);

    // Send email with PDF attachment
    await sendInvoiceEmail(
      invoice.client.email,
      invoice.invoice_number,
      invoice.client.contact_name || invoice.client.company_name,
      invoice.amount,
      publicUrl,
      pdfBufferForEmail,
      brandTheme
    );

    // Update invoice status to SENT
    await invoiceService.updateInvoice(id, { status: 'SENT' });

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      pdfUrl: publicUrl
    });

  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json({ 
      message: "Failed to send invoice" 
    }, { status: 500 });
  }
} 