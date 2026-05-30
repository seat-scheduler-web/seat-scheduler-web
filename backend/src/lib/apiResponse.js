function sendError(res, status, message) {
  return res.status(status).json({ message });
}

export { sendError };
