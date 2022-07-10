const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubUserModule, paths } = require('./user.stubs');

describe('User module unit tests: Fetch functions', function() {
    it('Fetch with id');

    it('Fetch with session object');
});
