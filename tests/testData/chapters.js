const { faker } = require('@faker-js/faker');
const books = require('./books');

const chapters = [];

for (let i = 0; i<32; i++) {
    const id = i + 1;
    const bookID = (i % 4 == 0) ? 2 : Math.ceil(Math.random() * books.length);

    const contentURL = faker.internet.url();
    const cover = faker.image.image();

    chapters.push({
        id,
        bookID,
        contentURL
    });

}

module.exports = chapters;
