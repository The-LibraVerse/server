const dal = require('../../src/books/book.dal');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');

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

    it('FetchByID should return book data', function() {
        const book = testData.books[4];

        return dal.fetchByID(book.id)
            .then(res => {
                expect(res).to.have.keys('id', 'title', 'cover', 'published',
                    'forSale', 'tokenContract', 'tokenID', 'metadataURI', 'metadataHash',
                    'author');
                expect(res).to.have.property('id', book.id);
                expect(res).to.have.property('title', book.title);
                expect(res).to.have.property('cover', book.cover);
                expect(res).to.have.property('forSale', book.forSale);
                expect(res).to.have.property('published', book.published);
                expect(res).to.have.property('tokenID', book.tokenID);
                expect(res).to.have.property('tokenContract', book.tokenContract);
                expect(res).to.have.property('metadataHash', book.metadataHash);
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
