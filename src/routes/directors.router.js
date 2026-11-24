const express = require('express');
const validateDirector = require('../middlewares/validateDirector');
const {
  listDirectors,
  getDirectorById,
  createDirector,
  updateDirector,
  deleteDirector,
} = require('../controllers/directors.controller');

const router = express.Router();

router.get('/', listDirectors);
router.get('/:id', getDirectorById);
router.post('/', validateDirector, createDirector);
router.patch('/:id', validateDirector, updateDirector);
router.delete('/:id', deleteDirector);

module.exports = router;