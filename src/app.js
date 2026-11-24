const express = require('express');
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const genresRouter = require('./routes/genres.router');
const directorsRouter = require('./routes/directors.router');
const moviesRouter = require('./routes/movies.router');
const catalogRouter = require('./routes/catalog.router');
const fs = require('node:fs');
const path = require('node:path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const app = express();

app.use(logger);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/genres', genresRouter);
app.use('/directors', directorsRouter);
app.use('/movies', moviesRouter);
app.use(catalogRouter);
const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
const openapi = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use(notFound);
app.use(errorHandler);

module.exports = app;