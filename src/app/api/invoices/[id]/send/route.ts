import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { invoiceService, userService } from "@/lib/database";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInvoiceEmail } from "@/lib/email";

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
    const { pdfPath } = await request.json();
    const invoice = await invoiceService.getInvoiceById(id);

    if (!invoice || invoice.client.user_id !== session.user.id) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }

    // Get user profile for company logo
    const userProfile = await userService.getUserById(session.user.id);
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

    // Download the PDF from Supabase
    const { data, error } = await supabaseAdmin.storage
      .from('invoice-attachments')
      .download(pdfPath);
    if (error || !data) {
      throw new Error('Failed to download PDF from Supabase');
    }
    const pdfBuffer = Buffer.from(await data.arrayBuffer());

    // Get public URL (optional, for reference)
    const { data: publicData } = supabaseAdmin.storage
      .from('invoice-attachments')
      .getPublicUrl(pdfPath);
    const publicUrl = publicData?.publicUrl || '';

    // Send email with PDF attachment
    await sendInvoiceEmail(
      invoice.client.email,
      invoice.invoice_number,
      invoice.client.contact_name || invoice.client.company_name,
      invoice.amount,
      publicUrl,
      pdfBuffer,
      brandTheme
    );

    // Delete the PDF from Supabase after sending
    await supabaseAdmin.storage.from('invoice-attachments').remove([pdfPath]);

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