const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubUserModule, paths } = require('./user.stubs');

describe.only('User module unit tests: Signup', function() {
    it('Signup(): Call userDAL.create() if data has username & password', function() {
        const stubs = createStubs();
        const spy = stubs[paths.userDal].create;

        const data = {
            username: faker.internet.userName(),
            password: faker.internet.password()
        }
        const user = stubUserModule(stubs)

        return user.signup(data)
            .then(() => {
                sinon.assert.calledWith(spy, data);
            });
    });

    it('Signup(): Call userDAL.create() if data has address', function() {
        const stubs = createStubs();
        const spy = stubs[paths.userDal].create;

        const data = { address: faker.finance.ethereumAddress() }
        const user = stubUserModule(stubs)

        return user.signup(data)
            .then(() => {
                sinon.assert.calledWith(spy, data);
            });
    });

    it('Signup({username, password}): Call sessionManager.create', function() {
        const stubs = createStubs();
        const spy = stubs[paths.session].create;

        const data = {
            username: faker.internet.userName(),
            password: faker.internet.password()
        }
        const user = stubUserModule(stubs)
        const reqObj = JSON.parse(faker.datatype.json());

        return user.signup(data, reqObj)
            .then(() => {
                sinon.assert.calledWith(spy, reqObj, sinon.match.has('id', sinon.match.number));
            });
    });

    it('Signup(address): Call sessionManager.create()', function() {
        const stubs = createStubs();
        const spy = stubs[paths.session].create;

        const data = { address: faker.finance.ethereumAddress() }
        const user = stubUserModule(stubs)
        const reqObj = JSON.parse(faker.datatype.json());

        return user.signup(data, reqObj)
            .then(() => {
                sinon.assert.calledWith(spy, reqObj, sinon.match.has('id', sinon.match.number));
            });
    });

    it('Signup(): Do not call user DAL if username & password + address are not present', function() {
        const stubs = createStubs();
        const spy = stubs[paths.userDal].create;

        const user = stubUserModule(stubs)

        const data = JSON.parse(faker.datatype.json());

        return user.signup(data)
            .catch(() => {
                sinon.assert.notCalled(spy);
            });
    });

    it('Signup(): Reject if username & password + address are not present', function() {
        const stubs = createStubs;
        const user = stubUserModule()

        const data = JSON.parse(faker.datatype.json());

        return expect( user.signup(data) ).to.be.rejectedWith(ClientError);
    });

    it('Signup(): If session does not exists, do not call dal.fetchByID', function() {
        const stubs = createStubs();
        const spy = stubs[paths.userDal].fetchByID;
        stubs[paths.session].get = sinon.fake.returns(false);

        const user = stubUserModule(stubs)

        const data = { address: faker.finance.ethereumAddress() }

        return user.signup(data, faker.datatype.json())
            .then(() => {
                sinon.assert.notCalled(spy);
            });
    });

    it('Signup(): If session already exists, call dal.fetchByID', function() {
        const stubs = createStubs();
        const userID = faker.datatype.number();
        const spy = stubs[paths.userDal].fetchByID;
        stubs[paths.session].get = sinon.fake.returns({userID});

        const user = stubUserModule(stubs)

        const data = { address: faker.finance.ethereumAddress() }

        return user.signup(data, faker.datatype.json())
            .then(() => {
                sinon.assert.calledWith(spy, userID);
            });
    });

    it('Signup(): If session already exists, do not call userDAL.create()', function() {
        const stubs = createStubs();
        stubs[paths.session].get = sinon.fake.returns({userID: 3});

        const spy = stubs[paths.userDal].create;

        const data = { address: faker.finance.ethereumAddress() }
        const user = stubUserModule(stubs)

        return user.signup(data)
            .then(() => {
                sinon.assert.notCalled(spy);
            });
    });

    it('Signup(): If session already exists, and dal.fetchByID return no address, set user address', function() {
        const userID = faker.datatype.number();

        const stubs = createStubs();
        stubs[paths.session].get = sinon.fake.returns({userID});

        stubs[paths.userDal].fetchByID = sinon.fake.resolves({id: userID,
            username: faker.internet.userName()});

        const spy = stubs[paths.userDal].update;

        const data = { address: faker.finance.ethereumAddress() }
        const user = stubUserModule(stubs)
        const reqObj = JSON.parse(faker.datatype.json());

        return user.signup(data, reqObj)
            .then(() => {
                sinon.assert.calledWith(spy, userID, sinon.match.has('address', data.address));
            });
    });
});
