const mongoose = require('mongoose');
console.log(mongoose.Types.ObjectId.isValid('53cb6b9b4f4ddef1ad47f943'));
// true
console.log(mongoose.Types.ObjectId.isValid('whatever'));
// false
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

//Pagination and Filter
const User = mongoose.model('users', mongoose.Schema(usersSchema));

module.exports = {
  mongoose,
  User,
};
