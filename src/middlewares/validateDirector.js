function validateDirector(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      message: 'Хүсэлтийн body нь JSON объект байх ёстой.',
    });
  }

  const fields = Object.keys(body);
  const unknownField = fields.find(
    (field) => field !== 'name' && field !== 'birthYear'
  );

  if (unknownField !== undefined) {
    return res.status(400).json({
      message: 'Энэ талбарыг оруулахыг зөвшөөрөхгүй.',
      field: unknownField,
    });
  }

  if (req.method === 'PATCH' && fields.length === 0) {
    return res.status(400).json({
      message: 'Засах талбараас дор хаяж нэгийг оруулна уу.',
    });
  }

  if (req.method === 'POST' || fields.includes('name')) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      return res.status(400).json({
        message: 'Найруулагчийн нэр хоосон байж болохгүй.',
        field: 'name',
      });
    }

    body.name = body.name.trim();
  }

  const { birthYear } = body;
  const currentYear = new Date().getFullYear();

  if (birthYear !== undefined && birthYear !== null &&
      (!Number.isInteger(birthYear) || birthYear < 1 || birthYear > currentYear)) {
    return res.status(400).json({
      message: `Төрсөн он 1–${currentYear} хоорондох бүхэл тоо байх ёстой.`,
      field: 'birthYear',
    });
  }

  next();
}

module.exports = validateDirector;