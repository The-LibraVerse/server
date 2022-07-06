const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const paths = {
    bookDal: './book.dal',
    chapterDal: './chapter.dal',
}

const bookPath = '../../src/books/book';

const defaultStubs = {
    [paths.bookDal]: {
        create: sinon.fake.resolves({id: 3}),
        latestChapter: sinon.fake.resolves({id: faker.datatype.number()}),
    },
    [paths.chapterDal]: { create: sinon.fake.resolves({
        id: faker.datatype.number()}),
    },
}

function createStubs() {
    return defaultStubs
}

function stubBook(stubs = defaultStubs) {
    return proxyquire(bookPath, stubs);
}

module.exports = {
    paths, stubBook, createStubs
}
