const { faker } = require('@faker-js/faker');
const users = require('./users');
const books = [];

for (let i=0; i<30; i++) {
    const userIndex = (i < 5) ? 0 :  Math.floor(Math.random() * users.length);
    const author = users[userIndex].id;

    const id = i+1;
    const title = faker.music.songName();
    const cover = faker.image.image();

    books.push({
        id,
        author,
        cover,
        title
    });
}

const library = [];

for (let i = 0; i<50; i++) {
    const userIndex = (i < 5) ? 0 :  Math.floor(Math.random() * users.length);
    const userID = users[userIndex].id;

    const bookIndex = (i < 5) ? 0 :  Math.floor(Math.random() * books.length);
    const bookID = books[bookIndex].id;

    library.push({
        userID,
        bookID,
    })
}

module.exports = books;
