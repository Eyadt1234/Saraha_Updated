const raise = (message, status, errors) => {
  throw new Error(message, { cause: { status, errors } });
};

export const badRequestError = (message = "Bad request", errors) => raise(message, 400, errors);

export const unauthorizedError = (message = "Unauthorized", errors) => raise(message, 401, errors);

export const forbiddenError = (message = "Forbidden", errors) => raise(message, 403, errors);

export const notFoundError = (message = "Not found", errors) => raise(message, 404, errors);

export const conflictError = (message = "Conflict", errors) => raise(message, 409, errors);