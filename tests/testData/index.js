const users = require('./users');
const books = require('./books');
const seedDb = require('./seedDatabase');

module.exports = {
    seedDb,
    seedDatabase: seedDb,

    users,
    books,
}
