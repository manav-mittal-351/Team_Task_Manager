exports.success = (res, message, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

exports.error = (res, message, errors = [], statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

exports.paginated = (res, data, page, limit, total) => {
  return res.status(200).json({ success: true, data, pagination: { page, limit, total } });
};
