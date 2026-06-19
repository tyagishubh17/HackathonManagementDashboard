const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.response) {
    return res.status(err.response.status || 502).json({
      message: "AI service error",
      detail: err.response.data,
    });
  }

  if (err.code === "ECONNREFUSED" || err.code === "ECONNRESET") {
    return res.status(503).json({ message: "AI service unavailable. Please try again later." });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
};

module.exports = errorHandler;
