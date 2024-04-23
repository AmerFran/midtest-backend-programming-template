const mongoose = require('mongoose');
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
app.get('/', async (req, res) => {
  const { page_number, limit } = req.query;
});
const User = mongoose.model('users', mongoose.Schema(usersSchema));

module.exports = {
  mongoose,
  User,
};
