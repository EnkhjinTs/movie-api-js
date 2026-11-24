require('dotenv').config();

const prisma = require('../src/db');

const genreNames = ['Драм', 'Адал явдал', 'Инээдэм', 'Нууцлаг', 'Уран зөгнөлт'];

const directorData = [
  { name: 'Бат-Эрдэнийн Тэмүүлэн', birthYear: 1978 },
  { name: 'Дашийн Саруул', birthYear: 1984 },
  { name: 'Ганболдын Мөнхжин', birthYear: 1981 },
  { name: 'Нямын Солонго', birthYear: 1988 },
  { name: 'Баярын Төгөлдөр', birthYear: 1986 },
  { name: 'Чулуунбатын Оюунаа', birthYear: 1990 },
];

// Мөр бүрийн дараалал: нэр, он, минут, төрөл, найруулагчийн индекс.
// Индекс 0 нь directorData жагсаалтын эхний найруулагчийг заана.
// null гэдэг нь найруулагчийн мэдээлэл байхгүй гэсэн утгатай.
const movieData = [
  ['Хаврын салхи', 2012, 98, 'Драм', 0],
  ['Говийн зам', 2014, 106, 'Адал явдал', 1],
  ['Ням гарагийн зочин', 2015, 89, 'Инээдэм', 2],
  ['Хаалттай өрөө', 2016, 103, 'Нууцлаг', 3],
  ['Сарны зүг', 2017, 114, 'Уран зөгнөлт', 4],
  ['Ээжийн захидал', 2018, 97, 'Драм', 5],
  ['Цаст уулын цаана', 2018, 112, 'Адал явдал', 0],
  ['Хоёр хөрш', 2019, 92, 'Инээдэм', 1],
  ['Шөнийн галт тэрэг', 2019, 105, 'Нууцлаг', 2],
  ['Оддын станц', 2020, 118, 'Уран зөгнөлт', 3],
  ['Маргаашийн захиа', 2020, 99, 'Драм', 4],
  ['Уулсын дундах жим', 2021, 110, 'Адал явдал', 5],
  ['Манай байрны баяр', 2021, 91, 'Инээдэм', 0],
  ['Алга болсон зураг', 2022, 101, 'Нууцлаг', 1],
  ['Цаг хугацааны цонх', 2022, 116, 'Уран зөгнөлт', 2],
  ['Сүүлчийн буудал', 2023, 104, 'Драм', 3],
  ['Хөх нуурын эрэл', 2023, 113, 'Адал явдал', 4],
  ['Таван найз', 2023, 94, 'Инээдэм', 5],
  ['Үл таних дуудлага', 2024, 102, 'Нууцлаг', 0],
  ['Сүүлчийн дагуул', 2024, 120, 'Уран зөгнөлт', 1],
  ['Буцах зам', 2025, 108, 'Драм', 2],
  ['Хилийн цаадах мөр', 2025, 115, 'Адал явдал', 3],
  ['Бүтэлгүй болзоо', 2025, 96, 'Инээдэм', null],
  ['Хоосон байшин', 2025, 109, 'Нууцлаг', null],
  ['Тэнгэрийн дохио', 2025, 122, 'Уран зөгнөлт', null],
];

const reviewers = [
  { authorName: 'Номин', rating: 5, comment: 'Үйл явдал сонирхолтой байлаа.' },
  { authorName: 'Билгүүн', rating: 4, comment: 'Дүрүүдийн харилцаа таалагдсан.' },
  { authorName: 'Марал', rating: 3, comment: 'Эхлэл арай удаан санагдсан.' },
];

async function main() {
  await prisma.$transaction(async (db) => {
    const genresByName = new Map();

    for (const name of genreNames) {
      const genre = await db.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      genresByName.set(name, genre.id);
    }

    const directors = [];

    for (const data of directorData) {
      const existing = await db.director.findFirst({ where: data });
      const director = existing ?? await db.director.create({ data });
      directors.push(director);
    }

    for (const [index, movieRow] of movieData.entries()) {
      const [title, year, durationMin, genreName, directorIndex] = movieRow;

      const existing = await db.movie.findFirst({
        where: { title, year },
      });

      const movie = existing ?? await db.movie.create({
        data: {
          title,
          year,
          durationMin,
          genreId: genresByName.get(genreName),
          directorId: directorIndex === null ? null : directors[directorIndex].id,
          isShowing: index >= 20,
        },
      });

      // Эхний 10 кино тус бүр 3, бусад 15 кино тус бүр 2 сэтгэгдэлтэй.
      const reviewCount = index < 10 ? 3 : 2;

      for (const reviewer of reviewers.slice(0, reviewCount)) {
        await db.review.upsert({
          where: {
            movieId_authorName: {
              movieId: movie.id,
              authorName: reviewer.authorName,
            },
          },
          update: {},
          create: { movieId: movie.id, ...reviewer },
        });
      }
    }
  }, { timeout: 30000 });

  const [genres, directors, movies, reviews, withoutDirector] = await Promise.all([
    prisma.genre.count(),
    prisma.director.count(),
    prisma.movie.count(),
    prisma.review.count(),
    prisma.movie.count({ where: { directorId: null } }),
  ]);

  console.log({ genres, directors, movies, reviews, withoutDirector });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });