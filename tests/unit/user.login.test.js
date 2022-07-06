const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubUserModule, paths } = require('./user.stubs');

describe('User module unit tests: Login', function() {
    it('Login: call userDAL.fetchByUsername if data = {address, password}', function() {
        const data = {
            username: faker.internet.userName(),
            password: faker.internet.password()
        }

        const stubs = createStubs();
        const spy = sinon.fake.resolves(data);
        stubs[paths.userDal].fetchByUsername = spy;

        const user = stubUserModule(stubs)

        return user.login(data)
            .then(() => {
                sinon.assert.calledWith(spy, data.username);
            });
    });

    it('Login(username, password): If password is correct, start session', function() {
        const data = {
            username: faker.internet.userName(),
            password: faker.internet.password()
        }

        const stubs = createStubs();
        stubs[paths.userDal].fetchByUsername = sinon.fake.resolves(data);

        const spy = stubs[paths.session].create;

        const user = stubUserModule(stubs)

        const reqObj = JSON.parse(faker.datatype.json());
        return user.login(data, reqObj)
            .then(() => {
                sinon.assert.calledWith(spy, reqObj, data);
            });
    });

    it('Login: fail if data.password does not match stored', function() {
        const username = faker.internet.userName();

        const stubs = createStubs();
        stubs[paths.userDal].fetchByUsername = sinon.fake.resolves({
            username, password: faker.internet.password()
        });

        const user = stubUserModule(stubs)

        const data = { username, password: faker.internet.password() }

        return expect(user.login(data))
            .to.be.rejectedWith(ClientError);
    });
});

