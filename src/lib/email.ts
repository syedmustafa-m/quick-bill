import nodemailer from "nodemailer";

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

export async function sendVerificationEmail(to: string, token: string) {
  const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verify your email address",
    html: `<p>Please click this link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
  });
} 