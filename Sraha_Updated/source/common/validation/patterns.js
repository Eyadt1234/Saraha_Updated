export const NAME_PATTERN = /^[A-Z][a-z]{1,19}\s[A-Z][a-z]{1,19}$/;
export const EMAIL_PATTERN = /^[a-zA-Z]{1,}\d{0,}[a-zA-Z0-9]{1,}[@][a-z]{1,}(\.com|\.edu|\.net){1,3}$/;
export const PASSWORD_PATTERN = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
export const EGYPT_PHONE_PATTERN = /^(002|\+2)?01[0125][0-9]{8}$/;
export const OTP_PATTERN = /^[0-9]{6}$/;