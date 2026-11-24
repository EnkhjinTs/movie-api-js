function notFound(req, res, next) {
  const error = new Error('Хүссэн хаяг олдсонгүй.');
  error.status = 404;
  next(error);
}

module.exports = notFound;
//бүртгэлгүй хаягт 404 алдаа үүсгэнэ.//