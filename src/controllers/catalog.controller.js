const prisma = require('../db');

const movieDetails = { genre: true, director: true };

function fail(status, message, field) {
  throw Object.assign(new Error(message), { status, field });
}

function positiveInt(raw, field, max = 2147483647) {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    fail(400, `${field} нь эерэг бүхэл тоо байх ёстой.`, field);
  }

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > max) {
    fail(400, `${field} зөвшөөрөгдсөн хязгаараас хэтэрсэн байна.`, field);
  }

  return value;
}

function option(raw, field, allowed, fallback) {
  if (raw === undefined) return fallback;
  if (!allowed.includes(raw)) {
    fail(400, `${field} нь ${allowed.join(', ')} утгын нэг байна.`, field);
  }
  return raw;
}

async function requireRecord(model, id, message, status = 404, field) {
  const record = await model.findUnique({ where: { id }, select: { id: true } });
  if (!record) fail(status, message, field);
}

async function checkMovieRelations(data) {
  if (data.genreId !== undefined) {
    await requireRecord(prisma.genre, data.genreId, 'Киноны төрөл олдсонгүй.', 400, 'genreId');
  }

  if (data.directorId !== undefined && data.directorId !== null) {
    await requireRecord(prisma.director, data.directorId, 'Найруулагч олдсонгүй.', 400, 'directorId');
  }
}

async function getMovie(req, res) {
  const id = positiveInt(req.params.id, 'id');
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { ...movieDetails, _count: { select: { reviews: true } } },
  });

  if (!movie) fail(404, 'Кино олдсонгүй.');

  const { _count, ...data } = movie;
  res.json({ ...data, reviewCount: _count.reviews });
}

async function createMovie(req, res) {
  await checkMovieRelations(req.body);
  const movie = await prisma.movie.create({
    data: req.body,
    include: movieDetails,
  });
  res.status(201).json(movie);
}

async function updateMovie(req, res) {
  const id = positiveInt(req.params.id, 'id');
  await requireRecord(prisma.movie, id, 'Кино олдсонгүй.');
  await checkMovieRelations(req.body);

  const movie = await prisma.movie.update({
    where: { id },
    data: req.body,
    include: movieDetails,
  });
  res.json(movie);
}

async function deleteMovie(req, res) {
  const id = positiveInt(req.params.id, 'id');
  await prisma.movie.delete({ where: { id } });
  res.status(204).end();
}

function pagination(query) {
  const page = positiveInt(query.page ?? '1', 'page', Number.MAX_SAFE_INTEGER);
  const limit = positiveInt(query.limit ?? '10', 'limit', 50);
  return { page, limit };
}

async function sendPage(res, model, where, { page, limit }, options) {
  const total = await model.count({ where });
  const pages = Math.ceil(total / limit);
  const data = page > pages ? [] : await model.findMany({
    ...options,
    where,
    skip: (page - 1) * limit,
    take: limit,
  });

  res.json({ data, meta: { page, limit, total, pages } });
}

function relatedMovies(parent, field, message) {
  return async (req, res) => {
    const id = positiveInt(req.params.id, 'id');
    const paging = pagination(req.query);
    await requireRecord(parent, id, message);

    await sendPage(res, prisma.movie, { [field]: id }, paging, {
      include: movieDetails,
      orderBy: { id: 'asc' },
    });
  };
}

const listGenreMovies = relatedMovies(prisma.genre, 'genreId', 'Киноны төрөл олдсонгүй.');
const listDirectorMovies = relatedMovies(prisma.director, 'directorId', 'Найруулагч олдсонгүй.');

async function listReviews(req, res) {
  const movieId = positiveInt(req.params.id, 'id');
  const paging = pagination(req.query);
  const sort = option(req.query.sort, 'sort', ['rating', 'createdAt'], 'createdAt');
  const order = option(req.query.order, 'order', ['asc', 'desc'], 'desc');

  await requireRecord(prisma.movie, movieId, 'Кино олдсонгүй.');
  await sendPage(res, prisma.review, { movieId }, paging, {
    orderBy: [{ [sort]: order }, { id: 'asc' }],
  });
}

async function createReview(req, res) {
  const movieId = positiveInt(req.params.id, 'id');
  await requireRecord(prisma.movie, movieId, 'Кино олдсонгүй.');

  const review = await prisma.review.create({
    data: { ...req.body, movieId },
  });
  res.status(201).json(review);
}

async function updateReview(req, res) {
  const id = positiveInt(req.params.id, 'id');
  const review = await prisma.review.update({
    where: { id },
    data: req.body,
  });
  res.json(review);
}

async function deleteReview(req, res) {
  const id = positiveInt(req.params.id, 'id');
  await prisma.review.delete({ where: { id } });
  res.status(204).end();
}

module.exports = {
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  listGenreMovies,
  listDirectorMovies,
  listReviews,
  createReview,
  updateReview,
  deleteReview,
};