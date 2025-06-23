export const createVerificationEmail = (
  verificationUrl: string, 
  userName: string,
  brandTheme?: { primary: string; secondary: string }
) => {
  // Default to orange theme if no brand theme provided
  const primaryColor = brandTheme?.primary || '#f97316';
  const secondaryColor = brandTheme?.secondary || '#ea580c';
  
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - InvGen</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 16px 0;
            text-align: center;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin: 0 0 32px 0;
            text-align: center;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }
        .button:hover {
            background: linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%);
        }
        .info-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .info-title {
            font-weight: 600;
            color: #374151;
            margin: 0 0 8px 0;
        }
        .info-text {
            color: #6b7280;
            margin: 0;
            font-size: 14px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        .link {
            color: ${primaryColor};
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 24px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">InvGen</h1>
        </div>
        
        <div class="content">
            <h2 class="title">Verify Your Email Address</h2>
            <p class="subtitle">Hi ${userName}, welcome to InvGen! Please verify your email address to complete your registration.</p>
            
            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="info-box">
                <h3 class="info-title">What happens next?</h3>
                <p class="info-text">
                    Once you verify your email, you'll have full access to create and manage invoices, 
                    track payments, and collaborate with your team. You can start using all features immediately.
                </p>
            </div>
            
            <div class="info-box">
                <h3 class="info-title">Having trouble?</h3>
                <p class="info-text">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="${verificationUrl}" class="link">${verificationUrl}</a>
                </p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This verification link will expire in 24 hours. If you didn't create an account with InvGen, 
                you can safely ignore this email.
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                © 2024 InvGen. All rights reserved.<br>
                <a href="#" class="link">Privacy Policy</a> • <a href="#" class="link">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;

  const textTemplate = `
Verify Your Email Address - InvGen

Hi ${userName},

Welcome to InvGen! Please verify your email address to complete your registration.

VERIFY EMAIL ADDRESS:
${verificationUrl}

What happens next?
Once you verify your email, you'll have full access to create and manage invoices, track payments, and collaborate with your team. You can start using all features immediately.

Having trouble?
If the link above doesn't work, copy and paste it into your browser:
${verificationUrl}

This verification link will expire in 24 hours. If you didn't create an account with InvGen, you can safely ignore this email.

© 2024 InvGen. All rights reserved.
  `;

  return {
    html: htmlTemplate,
    text: textTemplate,
    subject: "Verify your email address - InvGen"
  };
}; 