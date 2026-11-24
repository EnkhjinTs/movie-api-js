const express = require('express');
const catalog = require('../controllers/catalog.controller');
const { validateMovie, validateReview } = require('../middlewares/validateWrite');

const router = express.Router();

router.get('/movies/:id', catalog.getMovie);
router.post('/movies', validateMovie, catalog.createMovie);
router.patch('/movies/:id', validateMovie, catalog.updateMovie);
router.delete('/movies/:id', catalog.deleteMovie);

router.get('/genres/:id/movies', catalog.listGenreMovies);
router.get('/directors/:id/movies', catalog.listDirectorMovies);

router.get('/movies/:id/reviews', catalog.listReviews);
router.post('/movies/:id/reviews', validateReview, catalog.createReview);
router.patch('/reviews/:id', validateReview, catalog.updateReview);
router.delete('/reviews/:id', catalog.deleteReview);

module.exports = router;