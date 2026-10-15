import { forbiddenError } from "../common/exceptions/index.js";

//1: authorization
export const authorization = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      forbiddenError("You don't have access to this resource");
    }
    next();
  };
};