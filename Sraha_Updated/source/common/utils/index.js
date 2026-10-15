export const successResponse = (res, status = 200, body = {}) => {
  return res.status(status).json(body);
};

//isValidId
export const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));