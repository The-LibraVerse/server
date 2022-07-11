const { expect }  =require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
// const { user: userModule } = require('../../src/user');

describe('User module: integration tests - Fetch', function() {
    let userModule;

    beforeEach(() => {
        userModule = proxyquire('../../src/user/user', {
            '../sessionManager': { get: sinon.fake.returns({
                userID: testData.users[4].id }), }
        });

        return testData.seedDatabase()
    });

    it('Fetch with user id', function() {
        const user = testData.users[4];
        const userID = user.id;

        return userModule.fetch(userID)
            .then(res => {
                expect(res).to.have.property('id', user.id);
                expect(res).to.have.property('username', user.username);
                expect(res).to.have.property('name', user.name);
                expect(res).to.have.property('address', user.address);
                expect(res).to.have.keys('id', 'name', 'username', 'address');
            });
    });

    it('Fetch with session object', function() {
        const reqObj = JSON.parse(faker.datatype.json())
        const user = testData.users[4];
        const userID = user.id;

        return userModule.fetch(reqObj)
            .then(res => {
                expect(res).to.have.property('id', user.id);
                expect(res).to.have.property('username', user.username);
                expect(res).to.have.property('name', user.name);
                expect(res).to.have.property('address', user.address);
                expect(res).to.have.keys('id', 'name', 'username', 'address');
            });
    });
});
