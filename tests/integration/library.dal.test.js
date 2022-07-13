const dal = require('../../src/books/library.dal');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

const testData = require('../testData');

describe('Library data access layer', function() {
    beforeEach(() => {
        return testData.seedDatabase()
    });
    it('AddToLibrary');

    it('Fetch: default order by DateAdded', function() {
        const userID = testData.users[0].id;

        const library = testData.libraries.slice(-5);

        return dal.fetch(1)
            .then(res => {
                expect(res).to.have.lengthOf.at.most(library.length);
                const newest = res[0]; // newest book added should be first on the list
                const oldest = res.slice(-1)[0]; // last element on list should be the oldest book

                expect(oldest.dateAdded).to.be.below(newest.dateAdded);
                expect(oldest).to.have.property('dateAdded').that.is.a('date');
                expect(newest).to.have.property('dateAdded').that.is.a('date');

                res.forEach(entry => {
                    const _entry = library.filter(l => l.bookID == entry.bookID)[0];
                    expect(entry).to.have.property('dateAdded').that.is.a('date');

                    expect(entry.dateAdded).to.be.at.least(oldest.dateAdded);
                    expect(entry.dateAdded).to.be.at.most(newest.dateAdded);

                    expect(entry).to.have.property('userID', userID);
                    expect(entry).to.have.property('bookID', _entry.bookID);
                    expect(entry).to.have.property('bookTitle', _entry.bookTitle);
                    expect(entry).to.have.property('bookCover', _entry.bookCover);
                    expect(entry).to.have.property('bookAuthor', _entry.bookAuthor);
                    expect(entry).to.have.keys('userID', 'bookID', 'bookTitle', 'bookCover', 'bookAuthor', 'dateAdded', 'forSale');
                });
            });
    });
});
