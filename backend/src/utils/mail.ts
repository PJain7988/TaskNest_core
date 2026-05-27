import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendResetPasswordEmail = async (email: string, resetUrl: string): Promise<void> => {
  const mailOptions = {
    from: `"TaskNest Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'TaskNest Pro - Password Reset Request',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #4F46E5; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">TaskNest Pro</h2>
          <p style="color: #6B7280; font-size: 14px; margin-top: 5px;">Secure Password Recovery</p>
        </div>
        
        <div style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          <p>Hello,</p>
          <p>We received a request to reset the password associated with your TaskNest Pro account. Click the button below to secure your account and set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #4F46E5; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1); transition: all 0.2s ease;">Reset Password</a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">This link is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        
        <div style="text-align: center; color: #9CA3AF; font-size: 12px;">
          <p>If the button doesn't work, copy and paste the link below into your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;"><a href="${resetUrl}" style="color: #4F46E5; text-decoration: underline;">${resetUrl}</a></p>
          <p style="margin-top: 20px;">&copy; ${new Date().getFullYear()} TaskNest Pro. All rights reserved.</p>
        </div>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
