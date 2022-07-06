const { faker } = require('@faker-js/faker');
const users = require('./users');
const books = [];

for (let i=0; i<30; i++) {
    const userIndex = (i < 5) ? 0 :  Math.floor(Math.random() * users.length);
    const author = users[userIndex].id;

    const id = i+1;
    const title = faker.random.words();

    books.push({
        id,
        author,
        title
    });
}

module.exports = books;
