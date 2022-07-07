const dal = require('../../src/user/user.dal');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');

describe('User data access layer tests', function() {
    it('Create user with username and password, and fetchByID', function() {
        const username = faker.internet.userName();
        const password = faker.internet.password();

        const data = { username, password }

        return dal.create(data)
        .then(res => {
            expect(res).to.have.property('id').that.is.a('number');
            return dal.fetchByID(res.id)
        }).then(res => {
            expect(res).to.have.property('username', username);
            expect(res).to.have.property('password', password);
        });
    });

    it('Create user with address', function() {
        const address = faker.finance.ethereumAddress();

        return dal.create({address})
        .then(res => {
            expect(res).to.have.property('id').that.is.a('number');
            return dal.fetchByID(res.id)
        }).then(res => {
            expect(res).to.have.property('address', address);
        });
    });

    it('Update user address', function() {
        const newAddress = faker.finance.ethereumAddress();
        const user = testData.users[1];

        return dal.update(user.id, {address: newAddress})
        .then(res => {
            expect(res).to.have.keys('id', 'address');
            expect(res.address).to.equal(newAddress);
        });
    });

    it('Update user password', function() {
        const newPassword = faker.internet.password();
        const user = testData.users[1];

        return dal.update(user.id, {password: newPassword})
        .then(res => {
            expect(res).to.have.keys('id', 'password');
            expect(res.password).to.equal(newPassword);
        });
    });

    it('Update() should not change other users', function() {
        const newAddress = faker.finance.ethereumAddress();
        const user = testData.users[0];

        let promiseChain = Promise.resolve(true);

        return dal.update(user.id, {address: newAddress})
        .then(() => {
            testData.users.slice(0).forEach(u => {
                promiseChain = dal.fetchByID(u.id)
                .then(res => {
                    expect(res.address).to.not.equal(newAddress);
                    expect(res).to.contain(u);
                });
            });

            return promiseChain;
        });
    });

    it('FetchByUsername()', function() {
        const user = testData.users[3];
        const { username } = user;

        return dal.fetchByUsername(username)
        .then(res => {
            expect(res).to.contain(user);
        });
    });

    it('FetchByIDs()', function() {
        const num = faker.datatype.number({max: 10, min: 5});
        const users = Array.from({length: num}).fill('a').map(() => testData.randomUser())

        const ids = users.map(u => u.id);

        return dal.fetchByIDs(ids)
        .then(res => {
            expect(res).to.have.deep.members([
                ...new Set(users)]);
        });
    });
});
