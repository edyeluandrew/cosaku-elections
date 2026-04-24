import nodemailer from "nodemailer";
import { config } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  secure: false,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

export const sendVerificationEmail = async (
  email,
  fullName,
  verificationToken,
  verificationLink
) => {
  const mailOptions = {
    from: config.emailFrom,
    to: email,
    subject: "Verify Your COSAKU Votes Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #F5B700; padding: 20px; text-align: center;">
          <h1 style="color: #0B1F3A; margin: 0;">COSAKU Votes</h1>
          <p style="color: #0B1F3A; margin: 0; font-size: 14px;">Kabale University Elections</p>
        </div>
        
        <div style="padding: 30px; background-color: #F8FAFC;">
          <h2 style="color: #0B1F3A;">Hello ${fullName},</h2>
          
          <p style="color: #333; line-height: 1.6;">
            Thank you for registering for COSAKU Votes! Please verify your email address to complete your registration and start voting.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #F5B700; color: #0B1F3A; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">
            Or copy and paste this link in your browser:<br>
            ${verificationLink}
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            This link will expire in 24 hours.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            If you did not register for COSAKU Votes, please ignore this email.
          </p>
        </div>
        
        <div style="background-color: #0B1F3A; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">COSAKU Votes - Computing Students Association of Kabale University</p>
          <p style="margin: 5px 0 0 0;">© 2025 All rights reserved</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

export const sendResendVerificationEmail = async (
  email,
  fullName,
  verificationLink
) => {
  return sendVerificationEmail(email, fullName, null, verificationLink);
};

export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email service connected successfully");
    return true;
  } catch (error) {
    console.error("Email service error:", error);
    return false;
  }
};
