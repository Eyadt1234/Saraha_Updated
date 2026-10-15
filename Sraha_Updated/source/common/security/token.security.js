import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  LOGIN_CHALLENGE_TOKEN_SECRET,
  LOGIN_CHALLENGE_TOKEN_EXPIRES_IN,
} from "../../config.js";
import { TokenTypeEnum } from "../enum/index.js";

//1: generateToken / verifyToken
const tokenConfig = {
  [TokenTypeEnum.ACCESS]: { secret: ACCESS_TOKEN_SECRET, expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  [TokenTypeEnum.REFRESH]: { secret: REFRESH_TOKEN_SECRET, expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  [TokenTypeEnum.LOGIN_CHALLENGE]: { secret: LOGIN_CHALLENGE_TOKEN_SECRET, expiresIn: LOGIN_CHALLENGE_TOKEN_EXPIRES_IN },
};

export const generateToken = (payload, tokenType = TokenTypeEnum.ACCESS) => {
  const { secret, expiresIn } = tokenConfig[tokenType];
  return jwt.sign(payload, secret, { expiresIn, jwtid: randomUUID() });
};

export const verifyToken = (token, tokenType = TokenTypeEnum.ACCESS) => {
  return jwt.verify(token, tokenConfig[tokenType].secret);
};

//_________________________________________________________________________________//

//2: issueAuthTokens
export const issueAuthTokens = (user) => {
  const payload = { id: user._id, role: user.role };

  return {
    access_token: generateToken(payload, TokenTypeEnum.ACCESS),
    refresh_token: generateToken(payload, TokenTypeEnum.REFRESH),
  };
};