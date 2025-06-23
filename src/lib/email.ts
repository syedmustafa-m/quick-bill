import nodemailer from "nodemailer";
import { createVerificationEmail } from "./email-templates/verification";
import { createInvoiceEmail } from "./email-templates/invoice";

const smtpConfig = {
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

export async function sendVerificationEmail(
  to: string, 
  token: string, 
  userName?: string,
  brandTheme?: { primary: string; secondary: string }
) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;
  const emailTemplate = createVerificationEmail(verificationLink, userName || "there", brandTheme);
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
  });
}

export async function sendInvoiceEmail(
  to: string, 
  invoiceNumber: string, 
  clientName: string, 
  amount: number, 
  pdfUrl: string,
  pdfBuffer?: Buffer,
  brandTheme?: { primary: string; secondary: string }
) {
  const emailTemplate = createInvoiceEmail(invoiceNumber, clientName, amount, pdfUrl, brandTheme);
  
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
    text: emailTemplate.text,
  };

  // Add PDF attachment if buffer is provided
  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ];
  }

  await transporter.sendMail(mailOptions);
} 