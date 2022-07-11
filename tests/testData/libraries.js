const { faker } = require('@faker-js/faker');
const books = require('./books');
const users = require('./users');

const libraries = [];

for (let i = 0; i<50; i++) {
    let userIndex = (i < 5) ? 0 :  Math.floor(Math.random() * users.length);
    if(i >= 5 && userIndex == 0)
        userIndex = 5;

    const userID = users[userIndex].id;

    const bookIndex = (i < 5) ? i : Math.floor(Math.random() * books.length);
    const book = books[bookIndex];
    const bookID = books[bookIndex].id;

    libraries.push({
        userID,
        bookID,
        bookTitle: book.title,
        bookCover: book.cover,
        bookAuthor: book.author,
        date_added: faker.date.past(),
    })
}


module.exports = libraries;
