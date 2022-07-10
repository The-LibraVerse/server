const book = require('../../src/books/book');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');

describe('Book module: integration tests', function() {
    // beforeEach(() => testData.seedDatabase);

    it('Fetch chapter', function() {
        const chapter = testData.chapters[2];
        return book.fetchChapter(chapter.bookID, chapter.id)
        .then(res => {
            expect(res).to.not.be.undefined;
            expect(res).to.have.property('content', chapter._content);
        });
    });

    it('FetchAll should return book covers', function() {
        return book.fetchAll()
        .then(res => {
            expect(res).to.not.be.empty;
            res.forEach((b, i) => {
                expect(b).to.have.property('cover', testData.books[i].cover);
            });
        });
    });
});
