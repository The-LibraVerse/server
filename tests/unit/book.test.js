const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');

describe('Testing book module', function() {
    it('Create(): call book DAL with book data provided', function() {
        const spy = sinon.fake.resolves(true);

        const stubs = createStubs();
        stubs[paths.bookDal].create = spy;
        stubs[paths.session].get = sinon.fake.returns({ userID: 42 });

        const book = stubBook(stubs)
        const data = {
            name: faker.commerce.productName()
        }

        return book.create(data, faker.datatype.json())
            .then(() => {
                sinon.assert.calledWith(spy, sinon.match(data));
            });
    });

    it('Create(): Check session manager for author id', function() {
        const userID = faker.datatype.number();
        const spy = sinon.fake.resolves(true);
        const sessionManagerSpy = sinon.fake.returns({ userID });
        const reqObj = faker.datatype.json();

        const stubs = createStubs();
        stubs[paths.bookDal].create = spy;
        stubs[paths.session].get = sessionManagerSpy;

        const book = stubBook(stubs)
        const data = { name: faker.commerce.productName() }

        return book.create(data, reqObj)
            .then(() => {
                sinon.assert.calledWith(spy, sinon.match.has('author', userID));
                sinon.assert.calledWith(sessionManagerSpy, reqObj);
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

        const book = stubBook(stubs);

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

        const book = stubBook(stubs);

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

        const book = stubBook(stubs);

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
        stubs[paths.chapterDal].deleteChapter = dalSpy;

        const chapterID = faker.datatype.number();
        const bookID = faker.datatype.number();

        const book = stubBook(stubs);

        return book.deleteChapter(bookID, chapterID)
            .then(() => {
                sinon.assert.calledWith(dalSpy, bookID, chapterID);
            });
    });

    it('FetchAll should call dal.fetchAll', function() {
        const stubs = createStubs();
        const dalSpy = stubs[paths.bookDal].fetchAll;
        const book = stubBook(stubs);

        return book.fetchAll()
            .then(() => {
                sinon.assert.called(dalSpy);
            });
    });

    it('UserBooks(number): call dal.fetchByCreator(number)', function() {
        const userID = faker.datatype.number();
        const stubs = createStubs();
        const dalSpy = stubs[paths.bookDal].fetchByCreator;
        const book = stubBook(stubs);

        return book.userBooks(userID)
            .then(() => {
                sinon.assert.calledWith(dalSpy, userID);
            });
    });

    it('UserBooks(): Should return users creations, and reading list', function() {
        const userID = faker.datatype.number();
        const creations = [{
            id: faker.datatype.number(),
            title: faker.lorem.words(), author: userID
        }];

        const stubs = createStubs();
        stubs[paths.bookDal].fetchByCreator = sinon.fake.resolves(creations);
        const book = stubBook(stubs);

        return book.userBooks(userID)
            .then(res => {
                expect(res).to.have.property('creations').that.is.eql(creations);
            });
    });

    it('UserBooks(requestObject): call get userid from session manager', function() {
        const reqObj = faker.datatype.json();
        const stubs = createStubs();
        const spy = sinon.fake.returns({userID: faker.datatype.number()});
        stubs[paths.session].get = spy;
        const book = stubBook(stubs);

        return book.userBooks(reqObj)
            .then(() => {
                sinon.assert.calledWith(spy, reqObj);
            });
    });

    it('UserBooks(requestObject): call dal.fetchByCreator with id returned from session manager', function() {
        const userID = faker.datatype.number();
        const stubs = createStubs();
        const spy = stubs[paths.bookDal].fetchByCreator;
        stubs[paths.session].get = sinon.fake.returns({userID});
        const book = stubBook(stubs);

        return book.userBooks(faker.datatype.json())
            .then(() => {
                sinon.assert.calledWith(spy, userID);
            });
    });

    it('CreatedBy', function() {
        const userID = faker.datatype.number();
        const stubs = createStubs();
        const spy = stubs[paths.bookDal].fetchByCreator;
        stubs[paths.session].get = sinon.fake.returns({userID});
        const book = stubBook(stubs);

        return book.createdBy(faker.datatype.json())
            .then(() => {
                sinon.assert.calledWith(spy, userID);
            });
    });
});
