const sinon = require('sinon');
const { faker } = require('@faker-js/faker');

module.exports = function(results={}) {
    const getSession = results.getSession ?
        typeof results.getSession == 'number' ? {userID: results.getSession} :
            results.getSession :
        null;

    const externalFetch= {
        fetch: sinon.fake.resolves(true),
    };
    return {
        externalFetch,
        fetchExternal: externalFetch,
        sessionManager: {
            create: sinon.fake.returns(true),
            get: (getSession) ? sinon.fake.returns(getSession) : sinon.fake.returns(false),
            destroy: sinon.fake.resolves(true),
        },
        userDal: {
            create: sinon.fake.resolves({id: 3}),
            update: sinon.fake.resolves({id: faker.datatype.number()}),
            fetchByIDs: sinon.fake.resolves([{id: faker.datatype.number()}]),
            fetchByID: sinon.fake.resolves({id: faker.datatype.number()}),
            fetchByUsername: sinon.fake.resolves({
                id: faker.datatype.number(),
                username: faker.internet.userName(),
                password: faker.internet.password()
            }),
        },
        libraryDal: {
            addToLibrary: sinon.fake.resolves(true),
            fetch: sinon.fake.resolves([]),
        },
        bookDal: {
            create: sinon.fake.resolves({id: 3}),
            fetchAuthorID: sinon.fake.resolves(faker.datatype.number()),
            fetchByID: sinon.fake.resolves({}),
            fetchByCreator: sinon.fake.resolves([]),
            fetchAll: sinon.fake.resolves([]),
            latestChapter: sinon.fake.resolves({id: faker.datatype.number()}),
        },
        chapterDal: {
            create: sinon.fake.resolves({
                id: faker.datatype.number()}),
            fetchByID: sinon.fake.resolves(false),
            fetchAll: sinon.fake.resolves([]),
            fetchCount: sinon.fake.resolves(0),
            fetchCountForBook: sinon.fake.resolves(0),
            // deleteChapter: sinon.fake.resolves(true),
        },
    }
}

