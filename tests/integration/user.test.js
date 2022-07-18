const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
// const { user: userModule } = require('../../src/user');

describe('User module: integration tests - Fetch', function() {
    let userModule;
    const user = testData.users[0],
        userID = user.id;

    const reqObj = JSON.parse(faker.datatype.json())

    beforeEach(() => {
        userModule = proxyquire('../../src/user/user', {
            '../sessionManager': { get: sinon.fake.returns({ userID })
            }
        });

        return testData.seedDatabase()
    });

    it('Fetch with user id', function() {
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
        return userModule.fetch(reqObj)
            .then(res => {
                expect(res).to.have.property('id', user.id);
                expect(res).to.have.property('username', user.username);
                expect(res).to.have.property('name', user.name);
                expect(res).to.have.property('address', user.address);
                expect(res).to.have.keys('id', 'name', 'username', 'address');
            });
    });

    it('UserDashboard(): Should return user\'s authored book, and library', function() {
        const library = testData.libraries.slice(-5);

        return Promise.all([userModule.dashboard(userID, reqObj),
            userModule.dashboard(reqObj),
        ])
            .then(resArray => {
                expect(resArray).to.have.lengthOf(2);

                resArray.forEach(res => {
                    expect(res).to.not.be.empty;
                    expect(res).to.have.keys('id', 'name', 'username',
                        'library', 'creations', '_actions',
                    );
                    expect(res).to.have.property('id', user.id);
                    expect(res).to.have.property('name', user.name);
                    expect(res).to.have.property('username', user.username);

                    expect(res).to.have.property('library')
                        .that.has.lengthOf(library.length);

                    const combined = [...res.library, ...res.creations];

                    combined.forEach(b => {
                        expect(b).to.include.keys('title', 'cover', 'id', 'author');
                        expect(b.title).to.be.a('string');
                    });

                    res.creations.forEach(b => {
                        expect(b, 'Books written by user').to.have.keys(
                            'id', 'title', 'cover', 'author',
                            'published', 'forSale', 'metadataURI', 'metadataHash',
                            'tokenContract', 'tokenID', 'views', 'description'
                        );
                        expect(b.title).to.be.a('string');
                        expect(b.author).to.have.property('id', userID);
                    });

                    res.library.forEach((lib, i) => {
                        const bk = testData.books.filter(b => b.id == lib.id)[0];
                        expect(lib, 'Library').to.have.keys('id', 'title', 'cover', 'author',
                            'forSale');
                        expect(lib).to.have.property('title', bk.title);
                    });
                });
            });
    });
});
