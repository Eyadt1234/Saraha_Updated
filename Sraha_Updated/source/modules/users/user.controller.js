import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import {
  confirmLogin,
  confirmTwoStep,
  listUsers,
  login,
  loginWithGmail,
  logout,
  profile,
  refreshToken,
  requestTwoStep,
  signup,
} from "./user.service.js";
import { authentication, authorization, validation } from "../../middleware/index.js";
import { RoleEnum, TokenTypeEnum } from "../../common/enum/index.js";
import { signupSchema, loginSchema, otpSchema, gmailLoginSchema } from "../../common/validation/index.js";

const router = Router();

//1: POST /users/signup
router.post("/signup", validation(signupSchema), async (req, res) => {
  const data = await signup(req.body);
  return successResponse(res, 201, data);
});

//_________________________________________________________________________________//

//2: POST /users/login
router.post("/login", validation(loginSchema), async (req, res) => {
  const data = await login(req.body);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//3: POST /users/login/confirm
router.post("/login/confirm", authentication(TokenTypeEnum.LOGIN_CHALLENGE), validation(otpSchema), async (req, res) => {
  const data = await confirmLogin(req.user, req.body.otp);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//4: POST /users/login/gmail
router.post("/login/gmail", validation(gmailLoginSchema), async (req, res) => {
  const data = await loginWithGmail(req.body.idToken);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//5: POST /users/2fa/enable
router.post("/2fa/enable", authentication(), async (req, res) => {
  const data = await requestTwoStep(req.user);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//6: POST /users/2fa/confirm
router.post("/2fa/confirm", authentication(), validation(otpSchema), async (req, res) => {
  const data = await confirmTwoStep(req.user, req.body.otp);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//7: GET /users/profile
router.get("/profile", authentication(), async (req, res) => {
  const data = await profile(req.user);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//8: POST /users/refresh-token
router.post("/refresh-token", authentication(TokenTypeEnum.REFRESH), async (req, res) => {
  const data = refreshToken(req.user);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//9: POST /users/logout
router.post("/logout", authentication(), async (req, res) => {
  const data = await logout(req.user._id);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//10: GET /users (admin only)
router.get("/", authentication(), authorization(RoleEnum.ADMIN), async (req, res) => {
  const data = await listUsers(req.query.page);
  return successResponse(res, 200, data);
});

export default router;