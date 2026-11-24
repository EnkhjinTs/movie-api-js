const express = require('express');
const { listMovies } = require('../controllers/movies.controller');

const router = express.Router();

router.get('/', listMovies);

module.exports = router;