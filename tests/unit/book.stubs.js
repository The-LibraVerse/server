const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

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
    return {
        [paths.session]: {
            create: sinon.fake.returns(true),
            get: sinon.fake.returns(false),
        },
        [paths.userDal]: {
            userDal: {
                fetchByIDs: sinon.fake.resolves([{id: faker.datatype.number()}]),
                fetchByID: sinon.fake.resolves({id: faker.datatype.number()}),
                fetchByUsername: sinon.fake.resolves({
                    id: faker.datatype.number(),
                    username: faker.internet.userName(),
                    password: faker.internet.password()
                }),
            },
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
