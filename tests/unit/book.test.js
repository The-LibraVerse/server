const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../testData');

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

    it('AddChapter(): throw if user is not author of book', function() {
        const reqObj = faker.datatype.json();
        const dalSpy = sinon.fake.resolves(true);
        const bookID = faker.datatype.number();

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;

        stubs[paths.session].get = sinon.fake.returns({userID: faker.datatype.number()});

        const metadata = {
            title: faker.lorem.words(),
            cover: faker.image.image()
        }

        const content = faker.lorem.paragraphs();

        const bookModule = stubBook(stubs);

        return expect(bookModule.addChapter(bookID, {metadata, content}, reqObj))
            .to.be.rejectedWith(UnauthorizedError);
    });

    it('AddChapter(): throw if client does not have session', function() {
        const reqObj = faker.datatype.json();
        const dalSpy = sinon.fake.resolves(true);
        const bookID = faker.datatype.number();

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;

        stubs[paths.session].get = sinon.fake.returns(false);

        const metadata = {
            title: faker.lorem.words(),
            cover: faker.image.image()
        }

        const content = faker.lorem.paragraphs();

        const bookModule = stubBook(stubs);

        return expect(bookModule.addChapter(bookID, {metadata, content}, reqObj))
            .to.be.rejectedWith(UnauthorizedError);
    });

    it('AddChapter(): call chapter dal with create()', function() {
        const reqObj = faker.datatype.json();
        const dalSpy = sinon.fake.resolves(true);
        const bookID = faker.datatype.number();
        const userID = faker.datatype.number();

        const stubs = createStubs()
        stubs[paths.bookDal].fetchAuthorID = sinon.fake.resolves(userID);
        stubs[paths.chapterDal].create = dalSpy;
        stubs[paths.session].get = sinon.fake.returns({userID});

        const metadata = {
            title: faker.lorem.words(),
            cover: faker.image.image()
        }

        const content = faker.lorem.paragraphs();

        const bookModule = stubBook(stubs);

        return bookModule.addChapter(bookID, {metadata, content}, reqObj)
            .then(() => {
                sinon.assert.calledWith(dalSpy, bookID, content, metadata);
            });
    });

    it('AddChapter(): if no metadata, auto create title', function() {
        const dalSpy = sinon.fake.resolves(true);
        const numChapters = 11;
        const autoChapterName = 'Chapter 12';

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;
        stubs[paths.chapterDal].fetchCountForBook = sinon.fake.resolves(numChapters);

        const userID = faker.datatype.number();
        stubs[paths.bookDal].fetchAuthorID = sinon.fake.resolves(userID);
        stubs[paths.session].get = sinon.fake.returns({userID});

        const content = faker.lorem.paragraphs();

        const book = stubBook(stubs);

        return book.addChapter(faker.datatype.number(), {content})
            .then(() => {
                sinon.assert.calledWith(dalSpy, sinon.match.number, sinon.match.any, sinon.match.has('title', autoChapterName));
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

        return expect(book.addChapter(faker.datatype.number(), {metadata }))
            .to.be.rejectedWith(ClientError);
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
        stubs[paths.user].userDal.fetchByIDs = sinon.fake.resolves([{id: userID}]);
        const book = stubBook(stubs);

        return book.userBooks(userID)
            .then(res => {
                expect(res).to.have.property('creations').that.is.not.empty;

                res.creations.forEach((c, i) => {
                    expect(c.id).to.equal(creations[i].id);
                    expect(c.author).to.have.property('id', userID);
                    expect(c.title).to.equal(creations[i].title);
                });
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

    it('FetchBook: return book data from dal', function() {
        const author = 5;
        const bookID = 42
        const book = {
            id: faker.datatype.number(100),
            name: faker.commerce.productName(), author 
        };

        const stubs = createStubs();
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);
        const bookModule = stubBook(stubs);

        return bookModule.fetchBook(bookID)
        .then(res => {
            expect(res).to.include.keys('title', 'author', 'id');
        });
    });

    it('FetchBook: if book has no chapters, return 0', function() {
        const bookID = 42
        const book = {
            id: faker.datatype.number(100),
            name: faker.commerce.productName(), author: 5
        };

        const stubs = createStubs();
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);
        stubs[paths.chapterDal].fetchCountForBook = sinon.fake.resolves(false);
        stubs[paths.chapterDal].fetchCount = sinon.fake.resolves(false);
        const bookModule = stubBook(stubs);

        return bookModule.fetchBook(bookID)
        .then(res => {
            expect(res).to.have.property('totalChapters', 0);
        });
    });

    it('FetchBook: should return chapter ids and titles', function() {
        const author = 5;
        const bookID = 42
        const book = {
            id: faker.datatype.number(100),
            name: faker.commerce.productName(), author 
        };

        const chapters = faker.datatype.array().map((_a, index) => {
            return {
                id: index+71,
                title: 'Chapter ' + (index + 1),
                contentURL: faker.internet.url(),
                bookID,
            }
        });

        const stubs = createStubs();
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);

        const countSpy = sinon.fake.resolves(chapters);
        stubs[paths.chapterDal].fetchAll = countSpy;
        const bookModule = stubBook(stubs);

        return bookModule.fetchBook(bookID)
            .then(res => {
                sinon.assert.calledWith(countSpy, bookID);

                expect(res).to.have.property('chapters').that.has.lengthOf(chapters.length);
                res.chapters.forEach((c, i) => {
                    expect(c).to.have.keys('id', 'title');
                    expect(c).to.have.property('id', chapters[i].id);
                    expect(c).to.have.property('title', 'Chapter ' + (chapters[i].id - 70))
                });
            });
    });

    it('FetchBook: should have chapter count', function() {
        const author = 5;
        const totalChapters = faker.datatype.number(20);
        const bookID = 42
        const book = {
            id: faker.datatype.number(100),
            name: faker.commerce.productName(), author 
        };

        const stubs = createStubs();
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);
        const countSpy = sinon.fake.resolves(totalChapters);
        stubs[paths.chapterDal].fetchCountForBook = countSpy;
        stubs[paths.chapterDal].fetchCount = countSpy;
        const bookModule = stubBook(stubs);

        return bookModule.fetchBook(bookID)
        .then(res => {
            expect(res).to.have.property('totalChapters', totalChapters);
            sinon.assert.calledWith(countSpy, bookID);
        });
    });

    [
        {name: 'FetchBook - fetch single book', fn: 'fetchBook', params: ['bookID'], fetchOne: true},
        {name: 'FetchAll', fn: 'fetchAll', params: []},
        {name: 'CreatedBy - user logged in', fn: 'createdBy', params: ['reqObj']},
        {name: 'CreatedBy - user logged in', fn: 'createdBy', params: ['author']},
        {name: 'UserBooks - user logged in', fn: 'userBooks', params: ['reqObj']},
        {name: 'UserBooks - user logged in', fn: 'userBooks', params: ['author']}
    ] .forEach(testArgs => {
        it(testArgs.name + ': call userDAL for author information, and return author informaation', function() {
            const numAuthors = faker.datatype.number({max: 10, min: 5});
            const users = Array.from({length: numAuthors}).fill('a').map(() => testData.randomUser())

            users.push(users[0]);
            users.push(users[4]);
            const authorIDs = users.map(u => u.id);

            const books = authorIDs.map(author => ({
                id: faker.datatype.number(100),
                name: faker.commerce.productName(), author  }));

            const paramsS = {
                reqObj: JSON.parse(faker.datatype.json()),
                author: authorIDs[0],
                bookID: books[0].id,
                user:  authorIDs[0]
            }

            const stubs = createStubs();
            const spy = sinon.fake.resolves(users);
            stubs[paths.user].userDal.fetchByIDs = spy;
            stubs[paths.bookDal].fetchAll = sinon.fake.resolves(books);
            stubs[paths.bookDal].fetchByID = sinon.fake.resolves(books[0]),
                stubs[paths.bookDal].fetchByCreator = sinon.fake.resolves(books);
            stubs[paths.session].get = sinon.fake.returns({userID: authorIDs[0]});
            const book = stubBook(stubs);

            const params = testArgs.params ? 
                testArgs.params.map(p => paramsS[p]) : [];

            return book[testArgs.fn](...params)
                .then(res => {
                    if(testArgs.fetchOne)
                        sinon.assert.calledWith(spy, [authorIDs[0]]);
                    else
                        sinon.assert.calledWith(spy, [...new Set(authorIDs)]);

                    let library = [];

                    if(Array.isArray(res))
                        library = res;
                    else if(typeof library == 'object') {
                        Object.values(res).forEach(a => {
                            if(Array.isArray(a))
                                library = [...library, ...a];
                        });
                        if(library.length == 0)
                        library.push(res);
                    }

                    expect(library).to.not.be.empty;
                    library.forEach((b, index) => {
                        const author = users[index];
                        expect(b.author).to.have.property('id', author.id);
                        expect(b.author).to.have.property('username', author.username);
                        expect(b.author).to.have.property('name', author.name);
                        expect(b.author).to.have.keys('id', 'username', 'name');
                    });
                });
        });
    });

    it('CreatedBy should call dal.createdBy', function() {
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
