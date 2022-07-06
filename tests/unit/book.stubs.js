const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const paths = {
    bookDal: './book.dal',
    chapterDal: './chapter.dal',
    session: '../sessionManager',
}

const bookPath = '../../src/books/book';

function createStubs() {
    return {
        [paths.session]: {
            create: sinon.fake.returns(true),
            get: sinon.fake.returns(false),
        },
        [paths.bookDal]: {
            create: sinon.fake.resolves({id: 3}),
            fetchByID: sinon.fake.resolves({}),
            fetchByCreator: sinon.fake.resolves([]),
            fetchAll: sinon.fake.resolves([]),
            latestChapter: sinon.fake.resolves({id: faker.datatype.number()}),
        },
        [paths.chapterDal]: { create: sinon.fake.resolves({
            id: faker.datatype.number()}),
            deleteChapter: sinon.fake.resolves(true)

        },
    }
}

function stubBook(stubs) {
    if(!stubs)
        stubs = createStubs();

    return proxyquire(bookPath, stubs);
}

module.exports = {
    paths, stubBook, createStubs
}
