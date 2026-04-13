/* backend/helpers/responseHandler.js */

export const sendResponse = (res, statusCode, message, data = null, meta = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

export const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
