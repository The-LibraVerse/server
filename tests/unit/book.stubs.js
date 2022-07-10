const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const masterStubs = require('./stubs');

const paths = {
    session: '../sessionManager',
    user: '../user',
    userModule: '../user',
    userDal: '../user',
    bookDal: './book.dal',
    chapterDal: './chapter.dal',
}

const bookPath = '../../src/books/book';

function createStubs() {
    const allStubs = masterStubs();
    return {
        [paths.session]: allStubs.sessionManager,
        [paths.userDal]: {
            userDal: allStubs.userDal,
        },
        [paths.bookDal]: allStubs.bookDal,
        [paths.chapterDal]: allStubs.chapterDal,
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
