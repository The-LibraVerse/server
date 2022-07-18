const { faker } = require('@faker-js/faker');
const users = require('./users');
const books = [];

for (let i=0; i<30; i++) {
    const userIndex = (i < 5) ? 0 : 
        ((i + 1) % 7 == 0) ? 6 :
        Math.floor(Math.random() * users.length);

    const author = users[userIndex].id;

    const id = i+1;
    const title = faker.music.songName();
    const cover = faker.datatype.boolean() ? null : faker.image.image();

    const published = (id % 5 == 2) ? false :
        (id == 4 || id == 14) ? true : faker.datatype.boolean();

    const forSale = !published ? false :
        (published && (id == 4 || id == 14)) ? true : faker.datatype.boolean();

    const tokenContract = forSale ? faker.finance.ethereumAddress() : null;
    const tokenID = forSale ? faker.datatype.number() : null;

    const metadataHash = !published ? null : 'bafybe' + faker.random.alphaNumeric(53);
    const metadataURI = metadataHash ? 'http://' + metadataHash + '.ipfs.localhost:8080' : null;

    const views = 0;

    books.push({
        id,
        title,
        author,
        cover,
        views,
        published,
        forSale,
        metadataURI, metadataHash,
        tokenContract, tokenID,
    });
}

module.exports = Object.freeze(books);
