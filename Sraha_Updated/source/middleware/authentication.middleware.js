import { UserModel } from "../DB/model/index.js";
import { createRepository } from "../common/repository/index.js";
import { verifyToken } from "../common/security/index.js";
import { TokenTypeEnum } from "../common/enum/index.js";
import { unauthorizedError } from "../common/exceptions/index.js";

const userRepository = createRepository(UserModel);

//1: authentication
export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
  return async (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    if (scheme !== "Bearer" || !token) {
      unauthorizedError("Missing or invalid Authorization header");
    }

    let payload;
    try {
      payload = verifyToken(token, tokenType);
    } catch (error) {
      unauthorizedError("Invalid or expired token");
    }

    const user = await userRepository.findById(payload.id);
    if (!user) {
      unauthorizedError("Account no longer exists");
    }

    //2: payload.iat
    const revokedAtSeconds = user.changeCredentialsTime ? Math.floor(user.changeCredentialsTime.getTime() / 1000) : 0;
    if (payload.iat <= revokedAtSeconds) {
      unauthorizedError("Token is no longer valid, please login again");
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  };
};