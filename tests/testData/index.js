const users = require('./users');
const seedDb = require('./seedDatabase');

module.exports = {
    seedDb,
    seedDatabase: seedDb,

    users
}
