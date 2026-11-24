const express = require('express');
const validateGenre = require('../middlewares/validateGenre');
const {
  listGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} = require('../controllers/genres.controller');

const router = express.Router();

router.get('/', listGenres);
router.get('/:id', getGenreById);
router.post('/', validateGenre, createGenre);
router.patch('/:id', validateGenre, updateGenre);
router.delete('/:id', deleteGenre);

module.exports = router;