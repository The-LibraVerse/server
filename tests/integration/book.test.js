const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const fetch = require('../helpers/fetch');

describe('Book module: integration tests', function() {
    let bookModule;
    const userID = 1;

    before(() => {
        return testData.seedDatabase()
    });

    beforeEach(() => {
        bookModule = proxyquire('../../src/books/book', {
            '../sessionManager': { get: sinon.fake.returns({ userID }), }
        });
        return testData.seedDatabase()
    });

    it('Create', function() {
        const data = {
            title: faker.lorem.words(),
            cover: faker.image.image()
        }

        return bookModule.create(data)
            .then(res => {
                expect(res).to.have.property('id').that.is.a('number');
                return bookModule.fetchBook(res.id)
            }).then(res => {
                expect(res).to.have.property('title', data.title);
                expect(res).to.have.property('cover', data.cover);
            });
    });

    it('AddChapter(): Create chapter', function() {
        const content = faker.image.image();
        const cover = faker.image.image();
        const title = faker.lorem.words();
        const bookID = 2;

        return bookModule.addChapter(bookID, {content, title, cover})
            .then(res => {
                expect(res).to.have.property('id').that.is.a('number');
                return bookModule.fetchChapter(bookID, res.id)
            }).then(res => {
                expect(res).to.have.property('id').that.is.a('number');
                expect(res).to.have.property('book').that.has.property('id', bookID);
                expect(res).to.have.property('cover', cover);
                expect(res).to.have.property('title', title);
            });
    });

    it('Publish book: should create book metadata and set book publish status', function() {
        const book = testData.books[2], bookID = book.id;

        return bookModule.publish(bookID, faker.datatype.json())
            .then(() => bookModule.fetchBook(bookID))
            .then(res => {
                expect(res).to.have.property('published', true);
                expect(res).to.have.property('metadataURI')
                    .that.is.a('string');
                return fetch(res.metadataURI)
            }).then(res => {
                expect(res).to.contain({
                    name: book.title,
                    image: book.cover,
                    /*
                    properties: {
                        // preview: 
                    }
                    */
                });
            });
    });

    it('Publish chapter: should create chapter metadata and set chapter publish status', function() {
        const chapter = testData.chapters[2], chapterID = chapter.id,
            book = testData.books.filter(b => b.id == chapter.bookID)[0], bookID = book.id;

        return bookModule.publishChapter(chapterID)
            .then(() => bookModule.fetchChapter(bookID, chapterID))
            .then(res => {
                expect(res).to.have.property('published', true);
                expect(res).to.have.property('metadataURI')
                    .that.is.a('string');
                return fetch(res.metadataURI)
            }).then(res => {
                expect(res).to.contain({
                    name: chapter.title,
                    image: chapter.cover,
                    /*
                    properties: {
                        // preview: 
                    }
                    */
                });
            });
    });

    it('List book for sale', function() {
        const bookID = 2,
            data = {
                tokenContract: faker.finance.ethereumAddress(),
                tokenID: faker.datatype.number(40000)
            };

        return bookModule.listForSale(bookID, data, faker.datatype.json())
            .then(res => bookModule.fetchBook(bookID))
            .then(res => {
                expect(res).to.have.property('forSale', true);
                expect(res).to.contain(data);
            });
    });

    it('List chapter for sale', function() {
        const bookID = 2, chapterID = 3,
            data = {
                tokenContract: faker.finance.ethereumAddress(),
                tokenID: faker.datatype.number(40000)
            };

        return bookModule.listChapterForSale(chapterID, data, faker.datatype.json())
            .then(res => bookModule.fetchChapter(bookID, chapterID))
            .then(res => {
                expect(res).to.have.property('forSale', true);
                expect(res).to.contain(data);
            });
    });

    it('FetchChapter: should return book details', function() {
        const chapter = testData.chapters[2],
            book = testData.books[chapter.bookID],
            author = testData.users.filter(u => u.id == book.author)[0];

        return bookModule.fetchChapter(chapter.bookID, chapter.id)
            .then(res => {
                expect(res).to.not.be.undefined;
                expect(res).to.have.keys('id', 'cover', 'title', 'content',
                    'book', 'contentURL',
                    'published', 'metadataURI', 'metadataHash',
                    'forSale', 'tokenContract', 'tokenID',
                    '_actions', 
                );
                expect(res.book, 'book details').to.have.property('title');
                expect(res.book, 'book details').to.have.property('author')
                    .that.has.property('id', author.id);
                expect(res).to.have.property('content', chapter._content);
            });
    });

    it('FetchBook should return book data', function() {
        const book = testData.books[3], bookID = book.id;
        const chapters = testData.chapters.filter(c => c.bookID == bookID);
        const totalChapters = chapters.length;

        return bookModule.fetchBook(bookID)
            .then(res => {
                expect(res).to.have.keys('id', 'cover', 'title', 'author', 'views', 'description', 'metadataHash',
                    'published', 'forSale', 'metadataURI', 'totalChapters', 'chapters',
                    '_actions', 'tokenID', 'tokenContract'
                );

                expect(res).to.have.property('id', book.id);
                expect(res).to.have.property('title', book.title);
                expect(res).to.have.property('cover', book.cover);
                expect(res).to.have.property('published', book.published);
                expect(res).to.have.property('metadataURI', book.metadataURI);
                expect(res).to.have.property('views', 1);

                expect(res).to.have.property('forSale', book.forSale);
                expect(res).to.have.property('tokenContract', book.tokenContract);
                expect(res).to.have.property('tokenID', book.tokenID);
                expect(res.tokenContract).to.not.be.null;
                expect(res.tokenID).to.not.be.null;

                expect(res.chapters).to.not.be.empty;
                expect(res.chapters).to.have.lengthOf(totalChapters);
                expect(res).to.have.property('totalChapters', totalChapters);
                res.chapters.forEach((c, i) => {
                    expect(c).to.have.keys('id', 'title', 'cover',
                        'forSale', 'tokenContract', 'tokenID', 'published', 'contentURL',
                        'metadataURI', 'metadataHash');

                    const ch_ = chapters.filter(c__ => c__.id == c.id)[0];

                    expect(c).to.have.property('id', ch_.id).and.not.be.undefined;
                    expect(c).to.have.property('title', ch_.title).and.not.be.undefined;
                    expect(c).to.have.property('cover', ch_.cover).and.not.be.undefined;
                });
                return bookModule.fetchBook(3)
            })
            .then(res => {
                expect(res).to.have.property('views', 2);
                expect(res.forSale).to.be.false;
                expect(res.tokenContract).to.be.null;
                expect(res.tokenID).to.be.null;
            });
    });

    it('FetchAll should return book data', function() {
        return bookModule.fetchAll()
            .then(res => {
                expect(res).to.not.be.empty;
                res.forEach((b, i) => {
                    const bk = testData.books.filter(b_ => b_.id == b.id)[0];

                    expect(b).to.have.keys('id', 'cover', 'title', 'author',
                        'forSale', 'tokenContract', 'tokenID');
                    expect(b).to.have.property('id', bk.id);
                    expect(b).to.have.property('cover', bk.cover);
                    expect(b).to.have.property('title', bk.title);
                });
            });
    });

    it('AddToLibrary(): Add book to users library', function() {
        const book = testData.books.slice(-1)[0];
        const bookID = book.id;

        const author = testData.users.filter(u => u.id == book.author)[0];

        const library = testData.libraries.slice(-5);

        return bookModule.addToLibrary(bookID, faker.datatype.json())
            .then(() => bookModule.userBooks(userID))
            .then(res => {
                const entry = res.library.slice(0,1)[0];
                expect(entry).to.have.property('id', bookID)
                expect(entry).to.have.property('title', book.title)
                expect(entry).to.have.property('cover', book.cover)
                expect(entry).to.have.property('author').that.is.eql({
                    id: author.id,
                    name: author.name,
                    username: author.username
                });
            });
    });
});
