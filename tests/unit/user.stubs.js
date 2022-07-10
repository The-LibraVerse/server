const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const masterStubs = require('./stubs');

const paths = {
    userDal: './user.dal',
    session: '../sessionManager',
}

const userPath = '../../src/user/user';

function createStubs() {
    const allStubs = masterStubs();

    return {
        [paths.session]: allStubs.sessionManager,
        [paths.userDal]: allStubs.userDal,
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
