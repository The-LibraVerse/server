const { faker } = require('@faker-js/faker');
const books = require('./books');
const users = require('./users');

const libraries = [];

function getRandomBook(i) {
    const bookIndex = (i < 5) ? i : Math.floor(Math.random() * books.length);
    const book = books[bookIndex];

    const bookID = books[bookIndex].id;

    return book;
}

function anyNumberExcept(x, max) {
    if(x < max - 1)
        return Math.floor(Math.random() * (max - x)) + x;
    else {
        let result = x;

        while(result == x) {
            result = Math.floor(Math.random() * max);
        }

        return result;
    }
}

for (let i = 0; i<50; i++) {
    let book = getRandomBook(i);

    let userIndex = (i > 44) ? 0 :
        (book.id > 25) ? 7 :
        (i <= 44) ?  anyNumberExcept(1, users.length) :
        Math.floor(Math.random() * users.length);

    const userID = users[userIndex].id;

    const staleBooks = libraries.filter(lib => lib.userID == userID);
    let isStaleBook = staleBooks.map(e => e.bookID).includes(book.id);

    while(isStaleBook) {
        isStaleBook = staleBooks.map(e => e.bookID).includes(book.id);

        if(isStaleBook)
            book = getRandomBook(i);
        else isStaleBook = false;
    }

    const bookID = book.id;

    if(!isStaleBook) {
        libraries.push({
            userID,
            bookID,
            bookTitle: book.title,
            bookCover: book.cover,
            bookAuthor: book.author,
            date_added: faker.date.past(),
        })
    }
}

module.exports = libraries;
