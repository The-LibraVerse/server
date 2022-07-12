const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const masterStubs = require('./stubs');

const paths = {
    userDal: './user.dal',
    session: '../sessionManager',
    sessionManager: '../sessionManager',
    libraryDal: '../books/library.dal',
}

const userPath = '../../src/user/user';

function createStubs() {
    const allStubs = masterStubs();

    return {
        [paths.sessionManager]: allStubs.sessionManager,
        [paths.userDal]: allStubs.userDal,
        [paths.libraryDal]: allStubs.libraryDal,
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
