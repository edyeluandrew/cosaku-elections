/**
 * Email service using Brevo Transactional Email API
 * Replaces Nodemailer SMTP due to Render SMTP port blocking
 */

export const verifyEmailConnection = async () => {
  if (process.env.EMAIL_PROVIDER === "brevo") {
    if (!process.env.BREVO_API_KEY) {
      console.warn("BREVO_API_KEY is missing");
      return;
    }

    if (!process.env.EMAIL_FROM) {
      console.warn("EMAIL_FROM is missing");
      return;
    }

    console.log("✓ Brevo API email provider configured");
    return;
  }

  console.warn("No valid email provider configured");
};

export const sendVerificationEmail = async (
  email,
  fullName,
  verificationToken,
  verificationLink
) => {
  // Validate required environment variables
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is not configured");
    return { success: false, error: "Email service not configured" };
  }

  if (!process.env.EMAIL_FROM) {
    console.error("EMAIL_FROM is not configured");
    return { success: false, error: "Email service sender not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.EMAIL_FROM_NAME || "COSAKU Votes",
          email: process.env.EMAIL_FROM,
        },
        to: [
          {
            email: email,
            name: fullName || "COSAKU Voter",
          },
        ],
        subject: "Verify your COSAKU Votes account",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0B1F3A;">
            <div style="background-color: #F5B700; padding: 20px; text-align: center;">
              <h1 style="color: #0B1F3A; margin: 0;">COSAKU Votes</h1>
              <p style="color: #0B1F3A; margin: 0; font-size: 14px;">Kabale University Elections</p>
            </div>
            
            <div style="padding: 30px; background-color: #F8FAFC;">
              <h2 style="color: #0B1F3A;">Hello ${fullName || "COSAKU Voter"},</h2>
              
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
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Brevo API error:", {
        status: response.status,
        message: data.message || "Unknown error",
      });
      return {
        success: false,
        error: data.message || "Failed to send verification email",
      };
    }

    console.log("✓ Verification email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error.message);
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
