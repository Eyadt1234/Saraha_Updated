import { badRequestError } from "../common/exceptions/index.js";

//1: validation
export const validation = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));
    badRequestError("Validation error", errors);
  }

  req.body = result.data;
  next();
};