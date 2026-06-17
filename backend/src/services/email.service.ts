import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure the SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends the activation email containing the key and instructions.
 * @param toEmail The customer's email address
 * @param clinicName The name of the clinic
 * @param activationKey The generated activation key
 */
export const sendActivationEmail = async (toEmail: string, clinicName: string, activationKey: string): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured in .env. Skipping real email send, logging to console instead.');
    console.log(`\n========== EMAIL MOCK ==========`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Q Dent Software - Your Activation Key`);
    console.log(`Body: Hello ${clinicName},\nYour Activation Key is: ${activationKey}\n================================\n`);
    return;
  }

  const mailOptions = {
    from: `"Q Dent Admin" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Welcome to Q Dent - Your Activation Key',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Welcome to Q Dent, ${clinicName}!</h2>
        <p>Your subscription request has been approved.</p>
        <p>Please download the Q Dent Desktop App from our website and install it.</p>
        <br />
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold;">Your Activation Key:</p>
          <h3 style="margin: 10px 0; color: #1e293b; letter-spacing: 2px;">${activationKey}</h3>
        </div>
        <br />
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Open the Q Dent application.</li>
          <li>Click on <strong>"Activate Product"</strong>.</li>
          <li>Enter your Email Address and this Activation Key.</li>
          <li>Create your Admin Password.</li>
          <li>Click Activate.</li>
        </ol>
        <br />
        <p>If you need any assistance, please reply to this email.</p>
        <p>Best regards,<br/>The Q Dent Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Activation email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(`Failed to send activation email to ${toEmail}:`, error);
    throw new Error('Failed to send activation email. Please check SMTP configuration.');
  }
};

/**
 * Sends a notification email to the admin about a new clinic registration request.
 */
export const sendAdminNotificationEmail = async (clinicName: string, ownerName: string, email: string, phone: string, plan: string, billingCycle: string, overrideAdminEmail?: string): Promise<void> => {
  const adminEmail = overrideAdminEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admin@qdent.com';
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured in .env. Skipping real admin notification email, logging to console instead.');
    console.log(`\n========== ADMIN NOTIFICATION MOCK ==========`);
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: New Clinic Registration Request`);
    console.log(`Body: Clinic ${clinicName} requested a ${plan} plan.\n================================\n`);
    return;
  }

  const mailOptions = {
    from: `"Q Dent System" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `New Plan Enquiry: ${clinicName} wants the ${plan} Plan`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">New Plan Enquiry</h2>
        <p><strong>${ownerName}</strong> from <strong>${clinicName}</strong> has inquired about the software and wants to subscribe to the <strong>${plan}</strong> plan.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; border: 1px solid #e2e8f0; margin-top: 15px;">
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;"><strong>Clinic Name:</strong> ${clinicName}</li>
            <li style="margin-bottom: 8px;"><strong>Owner Name:</strong> ${ownerName}</li>
            <li style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</li>
            <li style="margin-bottom: 8px;"><strong>Phone:</strong> ${phone}</li>
            <li style="margin-bottom: 8px;"><strong>Requested Plan:</strong> ${plan}</li>
            <li><strong>Billing Cycle:</strong> ${billingCycle}</li>
          </ul>
        </div>
        <p style="margin-top: 20px;">Please contact them or log in to the admin dashboard to review and approve this request.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin notification email sent successfully for ${clinicName}`);
  } catch (error) {
    console.error(`Failed to send admin notification email:`, error);
  }
};
