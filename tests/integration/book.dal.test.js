const dal = require('../../src/books/book.dal');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

describe('Book data access layer', function() {
    it('Create and FetchByID', function() {
        const title = faker.lorem.words();
        const author = 3;

        return dal.create({title, author})
            .then(res => {
                expect(res).to.have.property('id').that.is.a('number');
                return dal.fetchByID(res.id)
            }).then(res => {
                expect(res).to.have.property('title', title);
            });
    });

    it('FetchAll', function() {
        return dal.fetchAll()
            .then(res => {
                expect(res).to.have.lengthOf.at.least(30);
            });
    });

    it('multi fetch functions should return the right properties', function() {
        let promiseChain = Promise.resolve();

        [ dal.fetchAll(),
            dal.fetchByCreator(1)
        ].forEach(search => {
            promiseChain = promiseChain.then(() => search)
                .then(res => {
                    expect(res).to.have.lengthOf.at.least(30);

                    res.forEach(b => {
                        expect(b).to.have.keys('id', 'title', 'author');
                        expect(b.id).to.be.a('number');
                        expect(b.title).to.be.a('string');
                        expect(b.author).to.be.a('number');
                    });
                });
        });
    });

    it('FetchByCreator should return all books by author', function() {
        const creatorID = 1;
        return dal.fetchByCreator(creatorID)
            .then(res => {
                expect(res).to.have.lengthOf.at.least(5);

                res.forEach(b => {
                    expect(b.author).to.be.a('number').that.equals(creatorID);
                });
            });
    });
});
