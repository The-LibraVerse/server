const dal = require('../../src/books/library.dal');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

const testData = require('../testData');

describe('Library data access layer', function() {
    before(() => {
    });

    it('AddToLibrary');

    it('Fetch: return books in user library', function() {
        const userID = testData.users[0].id;

        const library = testData.libraries.slice(0, 5);

        return dal.fetch(1)
            .then(res => {
                expect(res).to.have.lengthOf.at.most(library.length);
                res.forEach((entry, i) => {
                    expect(entry).to.have.property('userID', userID);
                    expect(entry).to.have.property('bookID', library[i].bookID);
                    expect(entry).to.have.property('bookTitle', library[i].bookTitle);
                    expect(entry).to.have.property('bookCover', library[i].bookCover);
                    expect(entry).to.have.property('bookAuthor', library[i].bookAuthor);
                    expect(entry).to.have.keys('userID', 'bookID', 'bookTitle', 'bookCover', 'bookAuthor', 'dateAdded', 'forSale');
                });
            });
    });
});
