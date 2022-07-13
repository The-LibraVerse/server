const { faker } = require('@faker-js/faker');
const books = require('./books');
const ipfsUpload = require('../helpers/ipfsUpload');

const publishedChapters = [], unpublishedChapters = [];

const chapters = require('./chapterContent/chapters.json');

const modChapters = chapters.map((c, i) => {
    const id = i + 1;
    const bookID = (i < 3) ? 2 :
        id % 10 == 0 ? 7 :
        id % 11 == 0 ? 14:
        Math.ceil(Math.random() * books.length);
    // const bookID = (i % 2 == 0) ? 2 : Math.ceil(Math.random() * books.length);

    const published = (i < 3) ? false :
        (i == 4) ? true :
        (bookID == 7 || bookID == 14) ? true : faker.datatype.boolean();

    const _content = c.content;
    const contentURL = c.contentURL;
    const metadataHash = published ? c.ipfsHash : null;
    const metadataURI = metadataHash ? 'http://' + metadataHash + '.ipfs.localhost:8080' : null;

    const cover = faker.image.image();
    const title = faker.word.interjection();
    const forSale = (!published) ? false :
        (bookID == 7) ? true : faker.datatype.boolean();

    const chapter = {
        _content,
        cover,
        id,
        bookID,
        title,
        contentURL,
        forSale,
        published,
        metadataHash,
        metadataURI,
    }

    if(published === true)
        publishedChapters.push(chapter);
    else if(published === false)
        unpublishedChapters.push(chapter);

    return chapter;
});

module.exports = { chapters: Object.freeze(modChapters),
    unpublishedChapters: Object.freeze(unpublishedChapters),
    publishedChapters: Object.freeze(publishedChapters) };
