const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const fetch = require('../helpers/fetch');

describe.only('Book module: integration tests', function() {
    let bookModule;
    const userID = 1;

    before(() => {
        // return testData.seedDatabase()
    });

    beforeEach(() => {
        bookModule = proxyquire('../../src/books/book', {
            '../sessionManager': { get: sinon.fake.returns({ userID }), }
        });
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
            .then(res => {
                expect(res).to.have.property('metadataURI')
                    .that.is.a('string');
            });
    });

    it('List chapter for sale', function() {
        const bookID = 2, chapterID = 3,
            data = {
                contract: faker.finance.ethereumAddress(),
                tokenID: faker.datatype.number(40000)
            };

        return bookModule.listChapterForSale(chapterID, data, faker.datatype.json())
            .then(res => {
                expect(res).to.have.property('metadataURI')
                    .that.is.a('string');
            });
    });

    it('Fetch chapter: user is author', function() {
        const chapter = testData.chapters[2];

        return bookModule.fetchChapter(chapter.bookID, chapter.id)
            .then(res => {
                expect(res).to.not.be.undefined;
                expect(res).to.have.keys('id', 'cover', 'title', 'content',
                    'book',
                    'published', 'forSale', 'metadataURI', 'metadataHash',
                );
                expect(res).to.have.property('content', chapter._content);
            });
    });

    it('Fetch should return book book data', function() {
        const book = testData.books[1], bookID = book.id;

        return bookModule.fetchBook(bookID)
            .then(res => {
                expect(res).to.have.keys('id', 'cover', 'title', 'author',
                    'published', 'forSale', 'metadataURI', 'metadataHash', 'totalChapters', 'chapters');

                expect(res).to.have.property('id', book.id);
                expect(res).to.have.property('title', book.title);
                expect(res).to.have.property('cover', book.cover);
                expect(res).to.have.property('published', book.published);
                expect(res).to.have.property('forSale', book.forSale);
                expect(res).to.have.property('metadataURI', book.metadataURI);
            });
    });

    it('FetchAll should return book covers', function() {
        return testData.seedDatabase()
            .then(() => bookModule.fetchAll())
            .then(res => {
                expect(res).to.not.be.empty;
                res.forEach((b, i) => {
                    expect(b).to.have.property('cover', testData.books[i].cover);
                });
            });
    });

    it('AddToLibrary(): Add book to users library', function() {
        const book = testData.books.slice(-1)[0];
        const bookID = book.id;

        const author = testData.users.filter(u => u.id == book.author)[0];

        const library = testData.libraries.slice(0, 5);

        return bookModule.addToLibrary(bookID, faker.datatype.json())
            .then(res => {

                return bookModule.userBooks(userID)
            })
            .then(res => {
                const entry = res.library.slice(-1)[0];
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

    it('UserBooks(): Fetch user\'s authored book, and library', function() {

        const library = testData.libraries.slice(0, 5);

        return testData.seedDatabase()
            .then(() => bookModule.userBooks(userID))
            .then(res => {
                expect(res).to.have.property('library')
                    .that.has.lengthOf(library.length);

                const combined = [...res.library, ...res.creations];

                combined.forEach(b => {
                    expect(b).to.include.keys('title', 'cover', 'id', 'author');
                    expect(b.title).to.be.a('string');
                    expect(b.author).to.have.property('id', userID);
                });

                res.creations.forEach(b => {
                    expect(b, 'Books written by user').to.have.keys('title', 'cover', 'id', 'author',
                        'published', 'forSale', 'metadataURI');
                    expect(b.title).to.be.a('string');
                    expect(b.author).to.have.property('id', userID);
                });

                res.library.forEach((lib, i) => {
                    expect(lib, 'Library').to.have.keys('title', 'cover', 'id', 'author',
                        'forSale');
                    expect(lib).to.have.property('title', library[i].bookTitle);
                });
            });
    });
});
