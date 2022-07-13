const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');

module.exports = function(results={}) {
    let books = results.books || [ ...testData.books ],
        book = results.book || (
        (books.length > 0) ? books[0] : { ...testData.books[3] });

    const author = results.author && typeof results.author == 'object' ? results.author :
        typeof results.author == 'number' ? {id: results.author} :
        {id: faker.datatype.number()};

    if(results.book)
        book = {...results.book};
    else {
        book = {...book, author: author.id};
    }

    const chapter = results.chapter || testData.chapters[9];

    const chapters = results.chapters || testData.chapters.slice(1,9);

    const countChapters = chapters.length;

    const rSession = results.getSession || results.session;

    const users = results.users || testData.users;

    const user = results.user || testData.users[5];
    const userByUsername = results.userByUsername || results.byUsername || user;

    const getSession = rSession ?
        typeof rSession == 'number' ? {userID: rSession} :
            rSession : false;

    const fetchResult = results.fetch || true;

    const externalFetch= {
        fetch: sinon.fake.resolves(fetchResult),
    };

    return {
        externalFetch,
        fetchExternal: externalFetch,
        sessionManager: {
            create: sinon.fake.returns(true),
            get: sinon.fake.returns(getSession),
            destroy: sinon.fake.resolves(true),
        },
        userDal: {
            create: sinon.fake.resolves({id: 3}),
            update: sinon.fake.resolves({id: faker.datatype.number()}),
            fetchByIDs: sinon.fake.resolves(users),
            fetchByID: sinon.fake.resolves(user),
            fetchByUsername: sinon.fake.resolves(userByUsername),
        },
        libraryDal: {
            addToLibrary: sinon.fake.resolves(true),
            fetch: sinon.fake.resolves([]),
        },
        bookDal: {
            create: sinon.fake.resolves({id: 3}),
            update: sinon.fake.resolves(true),
            fetchAuthorID: sinon.fake.resolves(author.id),
            fetchByID: sinon.fake.resolves(book),
            fetchByCreator: sinon.fake.resolves(books),
            fetchAll: sinon.fake.resolves(books),
            latestChapter: sinon.fake.resolves({id: faker.datatype.number()}),
        },
        chapterDal: {
            create: sinon.fake.resolves({
                id: faker.datatype.number()}),
            update: sinon.fake.resolves(true),
            fetchByID: sinon.fake.resolves(chapter),
            fetchAll: sinon.fake.resolves(chapters),
            fetchCount: sinon.fake.resolves(countChapters),
            fetchCountForBook: sinon.fake.resolves(countChapters),
            // deleteChapter: sinon.fake.resolves(true),
        },
    }
}

