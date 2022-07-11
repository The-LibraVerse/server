const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Book module: integration tests', function() {
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
                expect(res).to.have.keys('id', 'book', 'title', 'content', 'cover');
                expect(res).to.have.property('book').that.has.property('id', bookID);
                expect(res).to.have.property('cover', cover);
                expect(res).to.have.property('title', title);
            });
    });

    it('Fetch chapter', function() {
        const chapter = testData.chapters[2];

        return bookModule.fetchChapter(chapter.bookID, chapter.id)
            .then(res => {
                expect(res).to.not.be.undefined;
                expect(res).to.have.property('content', chapter._content);
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
                    expect(b).to.have.keys('title', 'cover', 'id', 'author');
                    expect(b.title).to.be.a('string');
                    expect(b.author).to.have.property('id', userID);
                });

                res.library.forEach((lib, i) => {
                    expect(lib).to.have.property('title', library[i].bookTitle);
                });
            });
    });
});
