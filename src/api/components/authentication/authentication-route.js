const express = require('express');
const rateLimit = require('express-rate-limit');
const authenticationControllers = require('./authentication-controller');
const authenticationValidators = require('./authentication-validator');
const celebrate = require('../../../core/celebrate-wrappers');

const route = express.Router();

const loginLimit = rateLimit({
  // loginLimit mengambil fungsi dari rateLimit yang sudah di inisialisasi di atas pada line 7
  max: 5,
  windowMs: 30 * 60 * 1000,
  message: 'Error 403 Forbidden: Too many failed login attempts.',
});

module.exports = (app) => {
  app.use('/authentication', route);

  route.post(
    '/login',
    celebrate(authenticationValidators.login),
    authenticationControllers.login,
    loginLimit
  );
};
