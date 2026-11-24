const prisma = require('../db');

function invalidQuery(field, message) {
  throw Object.assign(new Error(message), { status: 400, field });
}

function readInt(query, field, min, max, fallback) {
  const raw = query[field];

  if (raw === undefined) {
    return fallback;
  }

  const value = Number(raw);

  if (typeof raw !== 'string' || !/^\d+$/.test(raw) ||
      !Number.isSafeInteger(value) || value < min || value > max) {
    invalidQuery(field, `${field} нь ${min}–${max} хоорондох бүхэл тоо байх ёстой.`);
  }

  return value;
}

function readOption(query, field, options, fallback) {
  const value = query[field];

  if (value === undefined) {
    return fallback;
  }

  if (!options.includes(value)) {
    invalidQuery(field, `${field} нь ${options.join(', ')} утгын нэг байх ёстой.`);
  }

  return value;
}

async function listMovies(req, res) {
  const query = req.query;
  const maxInt = 2147483647;

  const page = readInt(query, 'page', 1, Number.MAX_SAFE_INTEGER, 1);
  const limit = readInt(query, 'limit', 1, 50, 10);
  const genreId = readInt(query, 'genreId', 1, maxInt);
  const directorId = readInt(query, 'directorId', 1, maxInt);
  const minYear = readInt(query, 'minYear', 1, maxInt);
  const maxYear = readInt(query, 'maxYear', 1, maxInt);
  const hasDirector = readOption(query, 'hasDirector', ['true', 'false']);
  const isShowing = readOption(query, 'isShowing', ['true', 'false']);

  const sort = readOption(
    query, 'sort', ['title', 'year', 'durationMin', 'createdAt'], 'createdAt'
  );
  const order = readOption(query, 'order', ['asc', 'desc'], 'desc');

  if (minYear !== undefined && maxYear !== undefined && minYear > maxYear) {
    invalidQuery('minYear', 'minYear нь maxYear-ээс их байж болохгүй.');
  }

  const where = {};

  if (genreId !== undefined) {
    where.genreId = genreId;
  }

  if (directorId !== undefined) {
    where.directorId = directorId;
  }

  if (hasDirector !== undefined) {
    // Хоёул ирвэл directorId болон hasDirector нөхцөлийг хамтад нь хэрэглэнэ.
    where.AND = [{ directorId: hasDirector === 'true' ? { not: null } : null }];
  }

  if (isShowing !== undefined) {
    where.isShowing = isShowing === 'true';
  }

  if (minYear !== undefined || maxYear !== undefined) {
    where.year = {};

    if (minYear !== undefined) {
      where.year.gte = minYear;
    }

    if (maxYear !== undefined) {
      where.year.lte = maxYear;
    }
  }

  if (query.q !== undefined) {
    if (typeof query.q !== 'string' || query.q.trim() === '') {
      invalidQuery('q', 'Хайлтын үг хоосон байж болохгүй.');
    }

    const contains = query.q.trim().replace(/[\\%_]/g, '\\$&');

    where.OR = [
      { title: { contains, mode: 'insensitive' } },
      { description: { contains, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.movie.count({ where });
  const pages = Math.ceil(total / limit);

  const data = page > pages ? [] : await prisma.movie.findMany({
    where,
    include: { genre: true, director: true },
    orderBy: [{ [sort]: order }, { id: 'asc' }],
    skip: (page - 1) * limit,
    take: limit,
  });

  return res.status(200).json({
    data,
    meta: { page, limit, total, pages },
  });
}

module.exports = { listMovies };