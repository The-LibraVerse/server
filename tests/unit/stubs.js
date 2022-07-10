const sinon = require('sinon');
const { faker } = require('@faker-js/faker');

module.exports = function() {
    return {
        sessionManager: {
            create: sinon.fake.returns(true),
            get: sinon.fake.returns(false),
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

