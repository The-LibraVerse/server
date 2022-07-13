const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubUserModule, paths } = require('./user.stubs');
const testData = require('../testData');

describe('User module unit tests: Fetch functions', function() {
    const reqObj = JSON.parse(faker.datatype.json());
    it('Fetch with id');

    it('Fetch with session object');

    it('Dashboard: When user is browsing own dashboard, return canCreateBook', function() {
        const user = testData.users[5];

        const userModule = stubUserModule({getSession: user.id, user})

        return Promise.all([
            userModule.dashboard(reqObj),
            userModule.dashboard(user.id, reqObj)
        ])
            .then(resArray => {
                expect(resArray).to.not.be.empty;
                resArray.forEach(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canCreateBook', true);
                });
            });
    });

    it('Dashboard: When browsing dashboard one does not own, do not return canCreateBook', function() {
        const user = testData.users[5];

        const userModule = stubUserModule({getSession: 103, user})

        return userModule.dashboard(user.id, reqObj)
            .then(res => {
                expect(res).to.have.property('_actions');
                expect(res._actions).to.not.have.property('canCreateBook');
                expect(res._actions).to.not.have.property('createBook');
            });
    });
});
