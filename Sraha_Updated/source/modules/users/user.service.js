import bcrypt from "bcryptjs";
import { UserModel } from "../../DB/model/index.js";
import { createRepository } from "../../common/repository/index.js";
import {
  decryptValue,
  encryptValue,
  issueAuthTokens,
  generateToken,
  generateOtp,
  hashOtp,
  compareOtp,
  verifyGoogleToken,
} from "../../common/security/index.js";
import { badRequestError, unauthorizedError } from "../../common/exceptions/index.js";
import { cacheDelete, cacheExpire, cacheGet, cacheIncrement, cacheSet, cacheTTL } from "../../common/cache/index.js";
import { sendOtpEmail } from "../../common/notifications/index.js";
import { TokenTypeEnum, OtpPurposeEnum, ProviderEnum } from "../../common/enum/index.js";
import { MAX_FAILED_LOGIN_ATTEMPTS, LOGIN_BAN_MINUTES, OTP_EXPIRES_MINUTES } from "../../config.js";

const userRepository = createRepository(UserModel);
const profileCacheKey = (userId) => `profile:${userId}`;
const loginAttemptsKey = (email) => `login-attempts:${email}`;
const loginBanKey = (email) => `login-ban:${email}`;
//clearLoginGuard
const clearLoginGuard = async (email) => {
  await cacheDelete(loginAttemptsKey(email));
  await cacheDelete(loginBanKey(email));
};
const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000);

const sanitizeUser = (user) => {
  const { password, otp, otpExpiresAt, otpPurpose, ...safeUser } = user.toObject();
  return { ...safeUser, phone: decryptValue(user.phone) };
};

//1: signup
export const signup = async (inputs) => {
  const { name, email, password, phone, age, gender } = inputs;

  const existingUser = await userRepository.findOne({ email });
  if (existingUser) {
    badRequestError("Email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const encryptedPhone = encryptValue(phone);

  await userRepository.create({
    name,
    email,
    password: hashedPassword,
    phone: encryptedPhone,
    age,
    gender,
    provider: ProviderEnum.SYSTEM,
  });

  return { message: "User added successfully." };
};

//_________________________________________________________________________________//

//2: login
export const login = async (inputs) => {
  const { email, password } = inputs;

  const user = await userRepository.findOne({ email });
  if (!user) {
    unauthorizedError("Invalid email or password");
  }

  if (!user.password) {
    badRequestError("This account signed up with Google - use 'Login with Gmail' instead.");
  }

  const guardEmail = user.email;
  const banTtl = await cacheTTL(loginBanKey(guardEmail));
  if (banTtl > 0) {
    unauthorizedError(`Account temporarily banned, try again in ${banTtl}s`);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const attempts = await cacheIncrement(loginAttemptsKey(guardEmail));
    if (attempts === 1) {
      await cacheExpire(loginAttemptsKey(guardEmail), LOGIN_BAN_MINUTES * 60);
    }
    if (attempts !== null && attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      await cacheSet(loginBanKey(guardEmail), "1", LOGIN_BAN_MINUTES * 60);
      await cacheDelete(loginAttemptsKey(guardEmail));
    }
    unauthorizedError("Invalid email or password");
  }

  //2FA is on?
  if (user.twoStepEnabled) {
    const otp = generateOtp();
    await userRepository.updateById(user._id, {
      otp: await hashOtp(otp),
      otpExpiresAt: minutesFromNow(OTP_EXPIRES_MINUTES),
      otpPurpose: OtpPurposeEnum.LOGIN,
    });
    await sendOtpEmail(user.email, otp);

    return {
      message: "OTP sent to your email, please confirm login.",
      login_challenge_token: generateToken({ id: user._id }, TokenTypeEnum.LOGIN_CHALLENGE),
    };
  }

  await clearLoginGuard(guardEmail);
  return { message: "Login successful", ...issueAuthTokens(user) };
};

//_________________________________________________________________________________//

//3: confirmLogin
export const confirmLogin = async (user, otp) => {
  if (!user.otp || user.otpPurpose !== OtpPurposeEnum.LOGIN) {
    unauthorizedError("No pending login confirmation for this account");
  }
  if (user.otpExpiresAt.getTime() < Date.now()) {
    unauthorizedError("OTP expired, please login again");
  }

  const isMatch = await compareOtp(otp, user.otp);
  if (!isMatch) {
    unauthorizedError("Invalid OTP");
  }

  await userRepository.updateById(user._id, { otp: null, otpExpiresAt: null, otpPurpose: null });
  await clearLoginGuard(user.email);

  return { message: "Login successful", ...issueAuthTokens(user) };
};

//_________________________________________________________________________________//

//4: requestTwoStep
export const requestTwoStep = async (user) => {
  const otp = generateOtp();
  await userRepository.updateById(user._id, {
    otp: await hashOtp(otp),
    otpExpiresAt: minutesFromNow(OTP_EXPIRES_MINUTES),
    otpPurpose: OtpPurposeEnum.ENABLE_2FA,
  });
  await sendOtpEmail(user.email, otp);

  return { message: "OTP sent to your email." };
};

//_________________________________________________________________________________//

//5: confirmTwoStep
export const confirmTwoStep = async (user, otp) => {
  if (!user.otp || user.otpPurpose !== OtpPurposeEnum.ENABLE_2FA) {
    unauthorizedError("No pending 2-step-verification request for this account");
  }
  if (user.otpExpiresAt.getTime() < Date.now()) {
    unauthorizedError("OTP expired, please try again");
  }

  const isMatch = await compareOtp(otp, user.otp);
  if (!isMatch) {
    unauthorizedError("Invalid OTP");
  }

  await userRepository.updateById(user._id, { twoStepEnabled: true, otp: null, otpExpiresAt: null, otpPurpose: null });
  await cacheDelete(profileCacheKey(user._id));

  return { message: "2-step-verification enabled." };
};

//_________________________________________________________________________________//

//6: loginWithGmail
export const loginWithGmail = async (idToken) => {
  const { email: googleEmail, name } = await verifyGoogleToken(idToken);
  const email = googleEmail.toLowerCase();

  let user = await userRepository.findOne({ email });
  if (!user) {
    user = await userRepository.create({ name, email, provider: ProviderEnum.GOOGLE });
  }

  return { message: "Login successful", ...issueAuthTokens(user) };
};

//_________________________________________________________________________________//

//7: profile
export const profile = async (user) => {
  const cacheKey = profileCacheKey(user._id);
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  const data = sanitizeUser(user);

  await cacheSet(cacheKey, data, 300);
  return data;
};

//_________________________________________________________________________________//

//8: refreshToken
export const refreshToken = (user) => issueAuthTokens(user);

//_________________________________________________________________________________//

//9: logout
export const logout = async (userId) => {
  await userRepository.updateById(userId, { changeCredentialsTime: new Date() });
  await cacheDelete(profileCacheKey(userId));
  return { message: "Logged out successfully." };
};

//_________________________________________________________________________________//

//10: listUsers
export const listUsers = async (page) => {
  const { data, ...pagination } = await userRepository.paginate({}, page);

  const users = data.map(sanitizeUser);

  return { ...pagination, users };
};