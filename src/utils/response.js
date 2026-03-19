const success = (data, meta = null) => ({
  status: 'success',
  data,
  ...(meta && { meta }),
});

const error = (message, code = 400, details = null) => ({
  status: 'error',
  message,
  code,
  ...(details && { details }),
});

module.exports = { success, error };