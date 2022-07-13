const proxyquire = require('proxyquire');
const masterStubs = require('../stubs');

const paths = {
    bookDal: './book.dal',
    chapterDal: './chapter.dal',
    chapterDAL: './chapter.dal',
    externalFetch: '../externalFetch',
    fetchExternal: '../externalFetch',
    libraryDal: '../books/library.dal',
    session: '../sessionManager',
    sessionManager: '../sessionManager',
    user: '../user',
    userModule: '../user',
    userDal: '../user',
    erc1155: '../api/erc1155',
}

const bookPath = '../../../src/books/book';

function isValidStubs(stubs) {
    return stubs && stubs[paths.session] && stubs[paths.userDal]
        && stubs[paths.libraryDal];
}

function createStubs(stubsInit) {
    const allStubs = masterStubs(stubsInit);

    return {
        [paths.erc1155]: allStubs.erc1155,
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
    else if(!isValidStubs(stubs))
        stubs = createStubs(stubs)

    return proxyquire(bookPath, stubs);
}

module.exports = {
    paths, stubBook, createStubs
}
