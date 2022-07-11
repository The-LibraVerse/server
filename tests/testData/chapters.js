const { faker } = require('@faker-js/faker');
const books = require('./books');
const ipfsUpload = require('../helpers/ipfsUpload');

const chapters = [];

for (let i = 0; i<7; i++) {
    const id = i + 1;
    const bookID = (i < 3) ? 2 : Math.ceil(Math.random() * books.length);
    // const bookID = (i % 2 == 0) ? 2 : Math.ceil(Math.random() * books.length);
    const _content = faker.lorem.paragraphs(20);

    const contentURL = faker.internet.url();
    const cover = faker.image.image();
    const title = faker.word.interjection();

    chapters.push({
        _content,
        cover,
        id,
        bookID,
        title,
        contentURL
    });

}

function uploadChaptersToIPFS() {
    const content = chapters.map(c => c._content);

    return ipfsUpload.batch(content)
        .then(res => {
            chapters.forEach((c, i) => {
                chapters[i].contentURL = res[i].url;
            });

            return chapters;
        });
}

module.exports = { chapters: Object.freeze(chapters), uploadChaptersToIPFS };
