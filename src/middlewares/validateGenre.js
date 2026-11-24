function validateGenre(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      message: 'Хүсэлтийн body нь JSON объект байх ёстой.',
    });
  }

  const unknownField = Object.keys(body).find((key) => key !== 'name');

  if (unknownField !== undefined) {
    return res.status(400).json({
      message: 'Энэ талбарыг оруулахыг зөвшөөрөхгүй.',
      field: unknownField,
    });
  }

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return res.status(400).json({
      message: 'Төрлийн нэр хоосон байж болохгүй.',
      field: 'name',
    });
  }

  req.body.name = body.name.trim();
  next();
}

module.exports = validateGenre;