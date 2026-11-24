const maxInt = 2147483647;

const text = (value) => typeof value === 'string' && value.trim().length > 0;
const integer = (min, max) => (value) =>
  Number.isInteger(value) && value >= min && value <= max;
const nullable = (check) => (value) => value === null || check(value);

const movieRules = {
  title: text,
  year: (value) => integer(1900, new Date().getFullYear() + 1)(value),
  durationMin: integer(1, maxInt),
  description: nullable(text),
  isShowing: (value) => typeof value === 'boolean',
  genreId: integer(1, maxInt),
  directorId: nullable(integer(1, maxInt)),
};

const reviewRules = {
  rating: integer(1, 5),
  comment: nullable(text),
  authorName: text,
};

function validateWrite(rules, required) {
  return (req, res, next) => {
    const body = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ message: 'JSON объект оруулна уу.' });
    }

    const fields = Object.keys(body);

    if (req.method === 'PATCH' && fields.length === 0) {
      return res.status(400).json({ message: 'Засах талбараа оруулна уу.' });
    }

    if (req.method === 'POST') {
      const missing = required.find((field) => !Object.hasOwn(body, field));

      if (missing) {
        return res.status(400).json({
          message: 'Заавал оруулах талбар дутуу байна.',
          field: missing,
        });
      }
    }

    const data = {};

    for (const field of fields) {
      if (!Object.hasOwn(rules, field) || !rules[field](body[field])) {
        return res.status(400).json({
          message: 'Талбар эсвэл утга буруу байна.',
          field,
        });
      }

      data[field] = typeof body[field] === 'string'
        ? body[field].trim()
        : body[field];
    }

    req.body = data;
    next();
  };
}

module.exports = {
  validateMovie: validateWrite(movieRules, ['title', 'year', 'durationMin', 'genreId']),
  validateReview: validateWrite(reviewRules, ['rating', 'authorName']),
};