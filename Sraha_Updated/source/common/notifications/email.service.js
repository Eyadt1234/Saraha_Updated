import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../../config.js";


const transporter = EMAIL_USER && EMAIL_PASS ? nodemailer.createTransport({ service: "gmail", auth: { user: EMAIL_USER, pass: EMAIL_PASS } }) : null;


//1: sendEmail
export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    const text = String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    console.log(`✉️  [EMAIL_USER/EMAIL_PASS not set] would send "${subject}" to ${to} -> ${text}`);
    return null;
  }

  try {
    return await transporter.sendMail({ from: EMAIL_USER, to, subject, html });
  } catch (error) {
    console.log("Email send failed:", error.message);
    return null;
  }
};