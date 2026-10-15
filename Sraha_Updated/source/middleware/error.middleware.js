//1: resolveStatus
const resolveStatus = (error) => {
  const status = error.cause?.status ?? error.status ?? error.statusCode;
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 500;
};

//_________________________________________________________________________________//

//2: globalErrorHandling
export const globalErrorHandling = (error, req, res, next) => {
  return res.status(resolveStatus(error)).json({
    error_message: error.message || "something went wrong",
    ...(error.cause?.errors ? { errors: error.cause.errors } : {}),
  });
};