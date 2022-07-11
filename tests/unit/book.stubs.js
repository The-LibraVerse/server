const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const masterStubs = require('./stubs');

const paths = {
    bookDal: './book.dal',
    chapterDal: './chapter.dal',
    chapterDAL: './chapter.dal',
    externalFetch: '../externalFetch',
    fetchExternal: '../externalFetch',
    libraryDal: '../books/library.dal',
    session: '../sessionManager',
    user: '../user',
    userModule: '../user',
    userDal: '../user',
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
        [paths.libraryDal]: allStubs.libraryDal,
        [paths.chapterDal]: allStubs.chapterDal,
        [paths.fetchExternal]: allStubs.fetchExternal,
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
