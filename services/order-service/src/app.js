const express = require('express');
const {
  requestIdMiddleware,
  accessLogMiddleware,
  noCacheMiddleware,
  notFoundHandler,
  errorHandler,
} = require('circlek-core');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(noCacheMiddleware);
app.use(accessLogMiddleware);
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
