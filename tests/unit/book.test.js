const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');

describe('Testing book module', function() {
    it('Create(): call book DAL with book data provided', function() {
        const spy = sinon.fake.resolves(true);

        const stubs = createStubs();
        stubs[paths.bookDal] = { create: spy }

        const book = stubBook(stubs)
        const data = {
            name: faker.commerce.productName()
        }

        return book.create(data)
            .then(() => {
                sinon.assert.calledWith(spy, data);
            });
    });

    it('AddChapter(): call chapter dal with create()', function() {
        const dalSpy = sinon.fake.resolves(true);

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;

        const metadata = {
            title: faker.lorem.words(),
            cover: faker.image.image()
        }

        const content = faker.lorem.paragraphs();

        const book = stubBook();

        return book.addChapter({metadata, content})
        .then(() => {
            sinon.assert.calledWith(dalSpy, metadata, content);
        });
    });

    it('AddChapter(): call chapter dal LatestChapter', function() {
        const dalSpy = sinon.fake.resolves(true);

        const stubs = createStubs()
        stubs[paths.bookDal].latestChapter = dalSpy;
        const bookID = faker.datatype.number();

        const metadata = {
            title: faker.lorem.words(),
            cover: faker.image.image()
        }

        const content = faker.lorem.paragraphs();

        const book = stubBook();

        return book.addChapter({bookID, metadata, content})
        .then(() => {
            sinon.assert.calledWith(dalSpy, bookID);
        });
    });

    it('AddChapter(): if no metadata, create metadata and auto create title', function() {
        const dalSpy = sinon.fake.resolves(true);

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;

        const content = faker.lorem.paragraphs();

        const book = stubBook();

        return book.addChapter({content})
        .then(() => {
            sinon.assert.calledWith(dalSpy, sinon.match.has('title', 'Chapter 1'), content);
        });
    });

    it('AddChapter(): reject if content is missing', function() {
        const dalSpy = sinon.fake.resolves(true);

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;

        const metadata = {
            title: faker.lorem.words(),
            cover: faker.image.image()
        }

        const content = faker.lorem.paragraphs();

        const book = stubBook();

        return expect(book.addChapter({metadata })
        ).to.be.rejectedWith(ClientError);
    });

    it('DeleteChapter(): call chapter dal with delete()', function() {
        // each chapter has a unique id
        const dalSpy = sinon.fake.resolves(true);

        const stubs = createStubs()
        stubs[paths.chapterDal].delete = dalSpy;

        const chapterID = faker.datatype.number();
        const bookID = faker.datatype.number();

        const book = stubBook();

        return book.deleteChapter(bookID, chapterID)
        .then(() => {
            sinon.assert.calledWith(dalSpy, bookID, chapterID);
        });
    });
});
