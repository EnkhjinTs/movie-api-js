function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Хүсэлтийн body зөв JSON форматтай байх ёстой.',
    });
  }

  if (error.code === 'P2002') {
    const body = { message: 'Ижил утгатай бүртгэл байна.' };
    const target = error.meta?.target;

    if (Array.isArray(target) && target.length === 1) {
      body.field = target[0];
    }

    return res.status(409).json(body);
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      message: 'Засах эсвэл устгах бүртгэл олдсонгүй.',
    });
  }

  if (error.code === 'P2003') {
    return res.status(409).json({
      message: 'Холбоотой бүртгэл байгаа тул үйлдлийг хийх боломжгүй.',
    });
  }

  const status = error.status ?? 500;

  if (status >= 500) {
    console.error(error);
    return res.status(status).json({
      message: 'Серверийн дотоод алдаа гарлаа.',
    });
  }

  const body = { message: error.message };

  if (error.field) {
    body.field = error.field;
  }

  return res.status(status).json(body);
}

module.exports = errorHandler;