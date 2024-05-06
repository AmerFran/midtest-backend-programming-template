const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const tokoSchema = require('./toko-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

//Pagination and Filter
const User = mongoose.model('users', mongoose.Schema(usersSchema));
const Toko = mongoose.model('toko', mongoose.Schema(tokoSchema));

module.exports = {
  mongoose,
  User,
  Toko,
};
