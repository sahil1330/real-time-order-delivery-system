import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
) {
  try {
    const verificationCode = verificationToken.substring(0, 6).toUpperCase();
    
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9e9e9; border-radius: 5px;">
          <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">Thank you for registering with our Order Delivery System. To complete your registration, please use the verification code below:</p>
          
          <div style="background-color: #f7f7f7; padding: 15px; margin: 20px 0; text-align: center; border-radius: 5px;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #3a86ff;">${verificationCode}</span>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5;">This code will expire in 30 minutes.</p>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">If you didn't request this verification, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9e9e9; text-align: center; color: #999; font-size: 14px;">
            <p>&copy; ${new Date().getFullYear()} Order Delivery System. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);
    return { success: false, error };
  }
}
         
