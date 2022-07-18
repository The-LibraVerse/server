const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../../testData');

describe('Testing book module: FetchChapter as author', function() {
    const reqObj = JSON.parse(faker.datatype.json());
        const author = testData.users[0];

    it('FetchChapter(): Do not return TOKEN_REQUIRED notice if book author is browsing', function() {
        const chapter = { ...testData.chapters[4], forSale: true, tokenID: 4,
            tokenContract:faker.finance.ethereumAddress() };

        const book = {...testData.books[chapter.bookID], author: author.id};

        const stubs = createStubs({getSession: author.id, fetch: chapter._content})

        stubs[paths.chapterDal].fetchByID = sinon.fake.resolves(chapter);
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);

        const bookModule = stubBook(stubs);

        return bookModule.fetchChapter(book.id, chapter.id)
            .then(res => {

                if(res._notice)
                    expect(res._notice).not.to.have.property('code', 'TOKEN_REQUIRED');
            });
    });

    it('FetchChapter(): Return content url and metadata url if browser is book author', function() {
        const chapter = testData.chapters[4];

        const book = {...testData.books[chapter.bookID], author: author.id};

        const stubs = createStubs({getSession: author.id, fetch: chapter._content})

        stubs[paths.chapterDal].fetchByID = sinon.fake.resolves(chapter);
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);

        const bookModule = stubBook(stubs);

        return bookModule.fetchChapter(book.id, chapter.id)
            .then(res => {
                expect(res).to.have.property('contentURL', chapter.contentURL);
                expect(res).to.have.property('metadataURI', chapter.metadataURI);
                expect(res).to.have.property('metadataURL', chapter.metadataURI);
            });
    });

    it('FetchChapter(): actions.canSell should be false if book is not published', function() {
        const chapter = testData.chapters[4];

        const book = {...testData.books[chapter.bookID], author: author.id, published: false};

        const stubs = createStubs({getSession: author.id, fetch: chapter._content})

        stubs[paths.chapterDal].fetchByID = sinon.fake.resolves(chapter);
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);

        const bookModule = stubBook(stubs);

        return bookModule.fetchChapter(book.id, chapter.id)
            .then(res => {
                expect(res).to.have.property('_actions').that.has.property('canSell', false);
            });
    });

    it('FetchChapter(): actions.canSell should be false if chapter is not published', function() {
        const chapter = {...testData.chapters[4], published: false};

        const book = {...testData.books[chapter.bookID], author: author.id, published: true};

        const stubs = createStubs({getSession: author.id, fetch: chapter._content})

        stubs[paths.chapterDal].fetchByID = sinon.fake.resolves(chapter);
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);

        const bookModule = stubBook(stubs);

        return bookModule.fetchChapter(book.id, chapter.id)
            .then(res => {
                expect(res).to.have.property('_actions').that.has.property('canSell', false);
            });
    });

    it('FetchChapter(): actions.canSell should be false if no chapter metadataURI', function() {
        const chapter = {...testData.chapters[4], published: true,
            metadataHash:undefined, metadataURI:undefined};

        const book = {...testData.books[chapter.bookID], author: author.id, published: true};

        const stubs = createStubs({getSession: author.id, fetch: chapter._content})

        stubs[paths.chapterDal].fetchByID = sinon.fake.resolves(chapter);
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);

        const bookModule = stubBook(stubs);

        return bookModule.fetchChapter(book.id, chapter.id)
            .then(res => {
                expect(res).to.have.property('_actions').that.has.property('canSell', false);
            });
    });

    it('FetchChapter(): Do not return content url and metadata url if browser is not book author', function() {
        const chapter = testData.chapters[4];
        const book = testData.books[chapter.bookID];

        const stubs = createStubs({getSession: faker.random.numeric(2)})
        stubs[paths.chapterDal].fetchByID = sinon.fake.resolves(chapter);
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);

        const bookModule = stubBook(stubs);

        return bookModule.fetchChapter(book.id, chapter.id)
            .then(res => {
                expect(res).to.not.have.property('contentURL');
                expect(res).to.not.have.property('metadataURI');
                expect(res).to.not.have.property('metadataURL');
            });
    });
});
