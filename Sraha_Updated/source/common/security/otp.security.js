import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

//1: generateOtp
export const generateOtp = () => String(randomInt(100000, 1000000));

//_________________________________________________________________________________//

//2: hashOtp / compareOtp
export const hashOtp = (otp) => bcrypt.hash(otp, 10);
export const compareOtp = (otp, hashedOtp) => bcrypt.compare(otp, hashedOtp);