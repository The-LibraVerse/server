const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const paths = {
    userDal: './user.dal',
    session: '../sessionManager',
}

const userPath = '../../src/user/user';

function createStubs() {
    return {
        [paths.session]: {
            create: sinon.fake.returns(true),
            get: sinon.fake.returns(false),
        },
        [paths.userDal]: {
            create: sinon.fake.resolves({id: 3}),
            update: sinon.fake.resolves({id: faker.datatype.number()}),
            fetchByID: sinon.fake.resolves({id: faker.datatype.number()}),
            fetchByUsername: sinon.fake.resolves({
                id: faker.datatype.number(),
                username: faker.internet.userName(),
                password: faker.internet.password()
            }),
        },
    }
}

function stubUserModule(stubs) {
    if(!stubs)
        stubs = createStubs();

    return proxyquire(userPath, stubs);
}

module.exports = {
    paths, stubUserModule, createStubs
}
