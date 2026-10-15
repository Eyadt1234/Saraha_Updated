import { sendEmail } from "./email.service.js";
import { OTP_EXPIRES_MINUTES } from "../../config.js";

//1: sendOtpEmail
export const sendOtpEmail = (email, otp) => {
  return sendEmail({
    to: email,
    subject: "Your verification code",
    html: `<p>Your OTP code is: <b>${otp}</b></p><p>It expires in ${OTP_EXPIRES_MINUTES} minutes.</p>`,
  });
};