const users = require('./users');
const randomUser = require('./randomUser');
const books = require('./books');
const seedDb = require('./seedDatabase');

module.exports = {
    seedDb,
    seedDatabase: seedDb,
    randomUser,

    users,
    books,
}
