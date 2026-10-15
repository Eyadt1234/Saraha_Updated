import { z } from "zod";
import { NAME_PATTERN, EMAIL_PATTERN, PASSWORD_PATTERN, EGYPT_PHONE_PATTERN, OTP_PATTERN } from "./patterns.js";
import { GenderEnum } from "../enum/index.js";

//1: signupSchema
export const signupSchema = z
  .object({
    name: z.string().regex(NAME_PATTERN, "name must be 'First Last', e.g. 'Eyad Tarek'"),
    email: z.string().regex(EMAIL_PATTERN, "please enter a valid email"),
    password: z.string().regex(PASSWORD_PATTERN, "password must be 8+ chars with an uppercase, a lowercase and a digit"),
    confirmPassword: z.string(),
    phone: z.string().regex(EGYPT_PHONE_PATTERN, "please enter a valid Egyptian phone number"),
    age: z.number().min(18).max(60),
    gender: z.enum(Object.values(GenderEnum)).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password and confirmPassword don't match",
    path: ["confirmPassword"],
  });

//_________________________________________________________________________________//

//2: loginSchema
export const loginSchema = z.object({
  email: z.string().regex(EMAIL_PATTERN, "please enter a valid email"),
  password: z.string().min(1, "password is required"),
});

//_________________________________________________________________________________//

//3: otpSchema
export const otpSchema = z.object({
  otp: z.string().regex(OTP_PATTERN, "OTP must be a 6-digit code"),
});

//_________________________________________________________________________________//

//4: gmailLoginSchema
export const gmailLoginSchema = z.object({
  idToken: z.string().min(10, "idToken is required"),
});