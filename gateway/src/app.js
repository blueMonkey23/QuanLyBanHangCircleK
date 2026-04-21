const express = require('express');
const { requestIdMiddleware, notFoundHandler, errorHandler } = require('circlek-core');
const routes = require('./routes');

const app = express();

app.use(requestIdMiddleware);
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
