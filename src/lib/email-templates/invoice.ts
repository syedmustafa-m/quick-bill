export function createInvoiceEmail(
  invoiceNumber: string, 
  clientName: string, 
  amount: number, 
  pdfUrl: string,
  brandTheme?: { primary: string; secondary: string }
) {
  const subject = `Invoice #${invoiceNumber} from InvGen`;
  
  // Default to orange theme if no brand theme provided
  const primaryColor = brandTheme?.primary || '#f97316';
  const secondaryColor = brandTheme?.secondary || '#ea580c';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoiceNumber}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); 
          color: white; 
          padding: 30px; 
          border-radius: 12px 12px 0 0; 
          text-align: center; 
        }
        .content { 
          background: #f9fafb; 
          padding: 30px; 
          border-radius: 0 0 12px 12px; 
        }
        .invoice-details { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid ${primaryColor}; 
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          font-weight: 600; 
          margin: 20px 0; 
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #e5e7eb; 
          font-size: 14px; 
          color: #6b7280; 
        }
        .amount { 
          font-size: 24px; 
          font-weight: bold; 
          color: ${primaryColor}; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">Invoice #${invoiceNumber}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your invoice is ready</p>
      </div>
      
      <div class="content">
        <h2>Hello ${clientName},</h2>
        
        <p>Thank you for your business! Your invoice has been prepared and is ready for review.</p>
        
        <div class="invoice-details">
          <h3 style="margin-top: 0; color: #374151;">Invoice Details</h3>
          <p><strong>Invoice Number:</strong> #${invoiceNumber}</p>
          <p><strong>Amount Due:</strong> <span class="amount">$${amount.toFixed(2)}</span></p>
          <p><strong>Status:</strong> <span style="color: #dc2626; font-weight: 600;">Pending Payment</span></p>
        </div>
        
        <p>Please find your invoice attached to this email. You can also view it online by clicking the button below:</p>
        
        <a href="${pdfUrl}" class="cta-button" target="_blank">
          View Invoice PDF
        </a>
        
        <p>If you have any questions about this invoice, please don't hesitate to reach out to us.</p>
        
        <p>Thank you for choosing our services!</p>
        
        <div class="footer">
          <p><strong>Best regards,</strong><br>
          The InvGen Team</p>
          
          <p style="font-size: 12px; margin-top: 20px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Invoice #${invoiceNumber} from InvGen

Hello ${clientName},

Thank you for your business! Your invoice has been prepared and is ready for review.

Invoice Details:
- Invoice Number: #${invoiceNumber}
- Amount Due: $${amount.toFixed(2)}
- Status: Pending Payment

Please find your invoice attached to this email. You can also view it online at: ${pdfUrl}

If you have any questions about this invoice, please don't hesitate to reach out to us.

Thank you for choosing our services!

Best regards,
The InvGen Team

---
This is an automated message. Please do not reply to this email.
  `;
  
  return { subject, html, text };
} 