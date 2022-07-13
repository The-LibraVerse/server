const users = require('./users');
const randomUser = require('./randomUser');
const books = require('./books');
const { publishedChapters, unpublishedChapters, chapters } = require('./chapters');
const  libraries = require('./libraries');
const seedDb = require('./seedDatabase');

module.exports = {
    seedDb,
    seedDatabase: seedDb,
    randomUser,

    libraries,
    library: libraries,
    users,
    books,

    chapters,
    publishedChapters, unpublishedChapters,
}
