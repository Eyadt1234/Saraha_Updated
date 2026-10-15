import { resolve } from "node:path";
import { config } from "dotenv";

config({
  path: resolve(`.env.${process.env.NODE_ENV ?? "development"}`),
});

export const PORT = parseInt(process.env.PORT ?? "9000");

export const DB_URI = process.env.DB_URI;
export const DB_NAME = process.env.DB_NAME;

export const ENC_KEY = process.env.ENC_KEY;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN ?? "3600");
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN ?? "2592000");

//1: short-lived token
export const LOGIN_CHALLENGE_TOKEN_SECRET = process.env.LOGIN_CHALLENGE_TOKEN_SECRET;
export const LOGIN_CHALLENGE_TOKEN_EXPIRES_IN = parseInt(process.env.LOGIN_CHALLENGE_TOKEN_EXPIRES_IN ?? "300");

export const MAX_FAILED_LOGIN_ATTEMPTS = parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS ?? "5");
export const LOGIN_BAN_MINUTES = parseInt(process.env.LOGIN_BAN_MINUTES ?? "5");
export const OTP_EXPIRES_MINUTES = parseInt(process.env.OTP_EXPIRES_MINUTES ?? "5");

export const REDIS_URI = process.env.REDIS_URI;

//2: Gmail SMTP
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

//3: Google Sign-In
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;