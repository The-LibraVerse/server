const { faker } = require('@faker-js/faker');
const users = require('./users');
const books = [];

for (let i=0; i<30; i++) {
    const userIndex = (i < 5) ? 0 :  Math.floor(Math.random() * users.length);
    const author = users[userIndex].id;

    const id = i+1;
    const title = faker.music.songName();
    const cover = faker.image.image();

    const published = (i % 5 == 2) ? false :
        (i == 3) ? true : faker.datatype.boolean()

    const forSale = !published ? false : faker.datatype.boolean();
    const metadataURI = !published ? null : faker.internet.url();
    const metadataHash = !published ? null : 'bafybe' + faker.random.alphaNumeric(53);

    books.push({
        id,
        author,
        cover,
        title,
        published,
        forSale,
        metadataURI,
        metadataHash,
    });
}

module.exports = Object.freeze(books);
