# Movie API · BED411

- Оюутны нэр: [Ц.Энхжин]
- Оюутны код: B24FM1030
- Сэдэв: Киноны төрөл, найруулагч, кино, сэтгэгдлийн API
- Технологи: Node.js, Express, Prisma 6, PostgreSQL

## Төслийг асаах

Node.js 22 LTS эсвэл түүнээс шинэ дэмжигддэг хувилбар, PostgreSQL хэрэгтэй. PostgreSQL-д `movie_api` нэртэй мэдээллийн сан үүсгээд ашиглах хэрэглэгчдээ түүнд холбогдох, хүснэгт үүсгэх эрх олгоно.

Төслийн үндсэн хавтсаас PowerShell дээр:

```powershell
npm install
Copy-Item .env.example .env
```

`.env` дотор PostgreSQL хэрэглэгчийн тохиргоогоо оруулна.

```dotenv
PORT=5000
DATABASE_URL="postgresql://postgres:CHANGE_ME@127.0.0.1:5432/movie_api?schema=public"
```

```powershell
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

- Серверийн шалгалт: http://localhost:5000/health
- Swagger UI: http://localhost:5000/docs
- Prisma Studio: тусдаа терминал дээр `npx prisma studio`

## API шалгах

Postman дээр `postman_collection.json`-ийг Import хийнэ. **Run collection** сонгож хавсаргасан дарааллаар ажиллуулна. Дараагийн хүсэлтэд ашиглах ID-г үүсгэх хүсэлтийн хариунаас авна. Collection туршилтдаа үүсгэсэн төрөл, найруулагч, кино, сэтгэгдлийг амжилттай дуусахдаа цэвэрлэнэ.

Swagger дээр тухайн endpoint-ийг дэлгээд **Try it out → Execute** дарна. ID-тай хүсэлтэд бодит бүртгэлийн ID оруулна.

## Устгалтын дүрэм

| Холбоо | Дүрэм | Шалтгаан |
|---|---|---|
| Genre → Movie | Restrict | Кино бүр төрөлтэй байх ёстой. Кинотой төрлийг устгах хүсэлтэд API 409 буцаана. |
| Director → Movie | SetNull | Найруулагчийн бүртгэлийг устгасан ч киноны бүртгэлийг хадгална. Киноны directorId хоосорно. |
| Movie → Review | Cascade | Сэтгэгдэл тухайн кинонд хамаардаг. Кино устахад сэтгэгдлүүдийг хамт устгана. |

## Хязгаарлалт

- Seed-ийн кино, найруулагчийн мэдээлэл нь сургалтын жишээ өгөгдөл.
- Seed-ийн тооны шалгалтыг хоосон санд хийвэл анхны 5 төрөл, 6 найруулагч, 25 кино, 60 сэтгэгдэл гарна. Өөрийн нэмсэн бүртгэлүүд тоонд орно.
- Postman collection ажиллах явц тасарвал өмнө нь үүсгэсэн туршилтын бүртгэлүүд үлдэж болно.
