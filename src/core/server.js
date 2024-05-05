const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const passport = require('passport');
const pinoHTTP = require('pino-http');
// tambahkan fungsi express rate limit dengan npm install express-rate-limit untuk membatasi limit login pada user
const rateLimit = require('express-rate-limit');
const app = express();
const config = require('./config');
const logger = require('./logger')('app');
const routes = require('../api');
const { errorResponder, errorHandler, errorTypes } = require('./errors');

// Fungsi Login Attempts Limit yang membatasi user untuk maksimal mencoba login hanya 5 kali ( dengan password atau pun email salah)
// Dan ada windowMs itu ialah middleware dari express-rate-limit yang membuat satuan waktu dalam milisecond , artinya jika ingin membuat 1 jam maka 60 * 60 * 1000
const loginLimit = rateLimit({
  // loginLimit mengambil fungsi dari rateLimit yang sudah di inisialisasi di atas pada line 7
  max: 5,
  windowMs: 30 * 60 * 1000,
  message: 'Error 403 Forbidden: Too many failed login attempts.',
});
// /api/authentication/login akan digunakan di operasi CRUD sebagai parameter nya sehingga kita bisa mengetes program yang dibuat
app.use('/api/authentication/login', loginLimit);

// Useful if behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc).
// It shows the real origin IP in the Heroku or Cloudwatch logs.
app.enable('trust proxy');

// Enable cross origin resource sharing to all origins by default
app.use(cors());

// Enable passport for API authorization
app.use(passport.initialize());

// Let you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
app.use(require('method-override')());

// Middleware that transforms the raw string of req.body into JSON
app.use(bodyParser.json());

// Needed to use multipart/form-data for file uploads
app.use(bodyParser.urlencoded({ extended: false }));

// Log HTTP requests with Pino
app.use(pinoHTTP({ logger }));

// Health check endpoints
app.get('/status', (_, response) => response.status(200).end());
app.head('/status', (_, response) => response.status(200).end());

// API routes
app.use(`${config.api.prefix}`, routes());

// Handle 404 route
app.use((request, response, next) =>
  next(errorResponder(errorTypes.ROUTE_NOT_FOUND, 'Route not found'))
);

// Error loggers
app.use((error, request, response, next) => {
  const ctx = {
    code: error.code,
    status: error.status,
    description: error.description,
  };

  // Log the user id who makes this request based on the API session token
  if (request.user) {
    ctx.user_id = request.user.userId || request.user.username || null;
  }

  // If this error is thrown by our code execution, then also log the stack trance
  if (error.stack) {
    ctx.stack = error.stack;
  }

  logger.error(ctx, error.toString());

  return next(error);
});

// Handle library error, e.g. JOI, Sequelize, etc.
app.use(errorHandler);

// Send error response to the caller
app.use((error, request, response, next) =>
  response.status(error.status || 500).json({
    statusCode: error.status || 500,
    error: error.code || 'UNKNOWN_ERROR',
    description: error.description || 'Unknown error',
    message: error.message || 'An error has occurred',
    // Handle JOI validation error
    ...(error.validationErrors && {
      validation_errors: error.validationErrors,
    }),
  })
);

module.exports = app;
