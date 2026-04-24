import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/env.js";

export const generateJWT = (payload, expiresIn = config.jwtExpiresIn) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
};

export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateEmailVerificationExpiry = (hours = 24) => {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};
