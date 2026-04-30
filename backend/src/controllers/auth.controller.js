import bcryptjs from "bcryptjs";
import { query } from "../config/db.js";
import { isValidKabEmail, isValidPassword } from "../utils/validators.js";
import {
  generateJWT,
  generateEmailVerificationToken,
  generateEmailVerificationExpiry,
} from "../utils/tokens.js";
import { sendVerificationEmail } from "../utils/email.js";
import { config } from "../config/env.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate Kabale University email
    if (!isValidKabEmail(email)) {
      return res
        .status(400)
        .json({
          error:
            "Invalid Kabale University email. Use format: 2024akcs0001gf@kab.ac.ug",
        });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters with uppercase, lowercase, and numbers",
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = generateEmailVerificationExpiry();

    // Create user
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, role, email_verification_token, email_verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name`,
      [
        fullName,
        email.toLowerCase(),
        passwordHash,
        "voter",
        verificationToken,
        verificationExpires,
      ]
    );

    const user = result.rows[0];

    // Generate verification link
    const verificationLink = `${config.clientUrl}/verify-email?token=${verificationToken}`;

    // Send verification email (non-blocking)
    sendVerificationEmail(
      user.email,
      user.full_name,
      verificationToken,
      verificationLink
    ).then((emailResult) => {
      if (emailResult.success) {
        console.log("✓ Verification email sent to:", user.email);
      } else {
        console.error("✗ Email sending failed:", emailResult.error);
      }
    }).catch((err) => {
      console.error("✗ Email send error:", err.message);
    });

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user by email
    const result = await query(
      `SELECT id, email, password_hash, role, is_email_verified, full_name 
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check email verification
    if (!user.is_email_verified) {
      return res
        .status(403)
        .json({
          error: "Please verify your email first. Check your inbox.",
        });
    }

    // Generate JWT
    const token = generateJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Verification token required" });
    }

    // Find user by verification token
    const result = await query(
      `SELECT id, email, full_name 
       FROM users 
       WHERE email_verification_token = $1 
       AND email_verification_expires > NOW()
       AND is_email_verified = false`,
      [token]
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token" });
    }

    const user = result.rows[0];

    // Update user as verified
    await query(
      `UPDATE users 
       SET is_email_verified = true, email_verification_token = NULL, email_verification_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    // Generate JWT token to automatically log them in
    const jwtToken = generateJWT({
      id: user.id,
      email: user.email,
      role: "voter",
    });

    res.json({
      message: "Email verified successfully",
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: "voter",
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    // Find user
    const result = await query(
      `SELECT id, full_name FROM users WHERE email = $1 AND is_email_verified = false`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "User not found or already verified",
      });
    }

    const user = result.rows[0];

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = generateEmailVerificationExpiry();

    // Update user with new token
    await query(
      `UPDATE users 
       SET email_verification_token = $1, email_verification_expires = $2
       WHERE id = $3`,
      [verificationToken, verificationExpires, user.id]
    );

    // Generate verification link
    const verificationLink = `${config.clientUrl}/verify-email?token=${verificationToken}`;

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email.toLowerCase(),
      user.full_name,
      verificationToken,
      verificationLink
    );

    if (!emailResult.success) {
      console.warn("Email sending failed:", emailResult);
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }

    res.json({
      message:
        "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, full_name, role, is_email_verified 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};
