const prisma = require('../db');

async function listDirectors(req, res) {
  const pageText = req.query.page ?? '1';
  const limitText = req.query.limit ?? '10';
  const page = Number(pageText);
  const limit = Number(limitText);

  if (typeof pageText !== 'string' || !/^\d+$/.test(pageText) ||
      !Number.isSafeInteger(page) || page < 1) {
    return res.status(400).json({
      message: 'page нь 1-ээс эхлэх бүхэл тоо байх ёстой.',
      field: 'page',
    });
  }

  if (typeof limitText !== 'string' || !/^\d+$/.test(limitText) ||
      !Number.isInteger(limit) || limit < 1 || limit > 50) {
    return res.status(400).json({
      message: 'limit нь 1–50 хоорондох бүхэл тоо байх ёстой.',
      field: 'limit',
    });
  }

  const total = await prisma.director.count();
  const pages = Math.ceil(total / limit);

  const data = page > pages ? [] : await prisma.director.findMany({
    orderBy: { id: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return res.status(200).json({
    data,
    meta: { page, limit, total, pages },
  });
}

async function getDirectorById(req, res) {
  const idText = req.params.id;
  const id = Number(idText);

  if (!/^\d+$/.test(idText) || id < 1 || id > 2147483647) {
    return res.status(400).json({
      message: 'id нь эерэг бүхэл тоо байх ёстой.',
      field: 'id',
    });
  }

  const director = await prisma.director.findUnique({
    where: { id },
    include: {
      _count: { select: { movies: true } },
    },
  });

  if (!director) {
    return res.status(404).json({
      message: 'Найруулагч олдсонгүй.',
    });
  }

  return res.status(200).json({
    id: director.id,
    name: director.name,
    birthYear: director.birthYear,
    createdAt: director.createdAt,
    movieCount: director._count.movies,
  });
}

async function createDirector(req, res) {
  const { name, birthYear } = req.body;

  const director = await prisma.director.create({
    data: { name, birthYear: birthYear ?? null },
  });

  return res.status(201).json(director);
}

async function updateDirector(req, res) {
  const idText = req.params.id;
  const id = Number(idText);

  if (!/^\d+$/.test(idText) || id < 1 || id > 2147483647) {
    return res.status(400).json({
      message: 'id нь эерэг бүхэл тоо байх ёстой.',
      field: 'id',
    });
  }

  const director = await prisma.director.update({
    where: { id },
    data: req.body,
  });

  return res.status(200).json(director);
}

async function deleteDirector(req, res) {
  const idText = req.params.id;
  const id = Number(idText);

  if (!/^\d+$/.test(idText) || id < 1 || id > 2147483647) {
    return res.status(400).json({
      message: 'id нь эерэг бүхэл тоо байх ёстой.',
      field: 'id',
    });
  }

  await prisma.director.delete({ where: { id } });

  return res.status(204).end();
}

module.exports = {
  listDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
};