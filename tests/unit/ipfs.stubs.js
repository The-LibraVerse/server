const { faker } = require('@faker-js/faker');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const masterStubs = require('./stubs');

const paths = {
    constants: '../constants',
}

const mainPath = '../../src/api/ipfs';

function createStubs() {
    const allStubs = masterStubs();
    return {
        [paths.constants]: {
        },
    }
}

function stubModule(stubs) {
    if(!stubs)
        stubs = createStubs();

    return proxyquire(mainPath, stubs);
}

module.exports = {
    paths, stubModule, createStubs
}
