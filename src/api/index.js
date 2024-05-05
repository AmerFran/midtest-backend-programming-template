const express = require('express');
const authentication = require('./components/authentication/authentication-route');
const usersRoutes = require('./components/users/users-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  usersRoutes(app);

  return app;
};
