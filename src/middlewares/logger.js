function logger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

module.exports = logger;
//хүсэлт бүрийн мэдээллийг терминалд хэвлэнэ.//