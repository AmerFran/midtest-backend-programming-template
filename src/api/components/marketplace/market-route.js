const express = require('express');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const marketController = require('./market-controller');
const marketValidator = require('./market-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/toko', route);

  // Get list of toko
  route.get('/', authenticationMiddleware, marketController.getUsers);
  route.get('/', function (req, res, next) {
    getUsers(req, res, next);
  });
  // Create user
  route.post(
    '/create',
    authenticationMiddleware,
    celebrate(marketValidator.createUser),
    marketController.createUser
  );

  // Get user detail
  route.get('/:id', authenticationMiddleware, marketController.getUser);

  // Update user
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(marketValidator.updateUser),
    marketController.updateUser
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, marketController.deleteUser);

  // Change password
  route.post(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(marketValidator.changePassword),
    marketController.changePassword
  );
};

route.get(marketController.getUsers);
