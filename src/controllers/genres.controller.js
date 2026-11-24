const prisma = require('../db');

async function listGenres(req, res) {
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

  const total = await prisma.genre.count();
  const pages = Math.ceil(total / limit);

  // Хуудас хүрээнээс гарвал хоосон жагсаалт буцаана.
  const data = page > pages ? [] : await prisma.genre.findMany({
    orderBy: { id: 'asc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return res.status(200).json({
    data,
    meta: { page, limit, total, pages },
  });
}

async function getGenreById(req, res) {
  const idText = req.params.id;
  const id = Number(idText);

  // ID нь PostgreSQL-ийн Int талбарт багтах эерэг бүхэл тоо байна.
  if (!/^\d+$/.test(idText) || id < 1 || id > 2147483647) {
    return res.status(400).json({
      message: 'id нь эерэг бүхэл тоо байх ёстой.',
      field: 'id',
    });
  }

  const genre = await prisma.genre.findUnique({
    where: { id },
    include: {
      _count: { select: { movies: true } },
    },
  });

  if (!genre) {
    return res.status(404).json({
      message: 'Киноны төрөл олдсонгүй.',
    });
  }

  return res.status(200).json({
    id: genre.id,
    name: genre.name,
    createdAt: genre.createdAt,
    movieCount: genre._count.movies,
  });
}

async function createGenre(req, res) {
  const genre = await prisma.genre.create({
    data: { name: req.body.name },
  });

  return res.status(201).json(genre);
}

async function updateGenre(req, res) {
  const idText = req.params.id;
  const id = Number(idText);

  if (!/^\d+$/.test(idText) || id < 1 || id > 2147483647) {
    return res.status(400).json({
      message: 'id нь эерэг бүхэл тоо байх ёстой.',
      field: 'id',
    });
  }

  const genre = await prisma.genre.update({
    where: { id },
    data: { name: req.body.name },
  });

  return res.status(200).json(genre);
}
async function deleteGenre(req, res) {
  const idText = req.params.id;
  const id = Number(idText);

  if (!/^\d+$/.test(idText) || id < 1 || id > 2147483647) {
    return res.status(400).json({
      message: 'id нь эерэг бүхэл тоо байх ёстой.',
      field: 'id',
    });
  }

  const genre = await prisma.genre.findUnique({
    where: { id },
    select: {
      _count: { select: { movies: true } },
    },
  });

  if (!genre) {
    return res.status(404).json({
      message: 'Киноны төрөл олдсонгүй.',
    });
  }

  if (genre._count.movies > 0) {
    return res.status(409).json({
      message: 'Кино бүртгэлтэй төрлийг устгах боломжгүй.',
    });
  }

  await prisma.genre.delete({ where: { id } });

  return res.status(204).end();
}
module.exports = {
  listGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
};