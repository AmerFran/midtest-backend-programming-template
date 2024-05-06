const express = require('express');
const authentication = require('./components/authentication/authentication-route');
const usersRoutes = require('./components/users/users-route');
const tokoRoutes = require('./components/marketplace/market-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  usersRoutes(app);
  tokoRoutes(app);

  return app;
};
