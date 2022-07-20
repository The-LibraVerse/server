const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../../testData');

describe('Testing book module', function() {
    const reqObj = JSON.parse(faker.datatype.json());

    it('Create: throw if user is not logged in', function() {
        const stubs = createStubs({session:false});

        const book = stubBook(stubs)
        const data = { name: faker.commerce.productName() }

        return expect(
            book.create(data, faker.datatype.json())
        ).to.be.rejectedWith(UnauthorizedError);

    });

    it('AddChapter(): throw if user is not author of book', function() {
        const dalSpy = sinon.fake.resolves(true);
        const bookID = faker.datatype.number();

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;

        stubs[paths.session].get = sinon.fake.returns({userID: faker.datatype.number()});

        const metadata = {title:faker.lorem.words(), cover:faker.image.image()}

        const content = faker.lorem.paragraphs();

        const bookModule = stubBook(stubs);

        return expect(bookModule.addChapter(bookID, {metadata, content}, reqObj))
            .to.be.rejectedWith(UnauthorizedError);
    });

    it('AddChapter(): throw if client does not have session', function() {
        const dalSpy = sinon.fake.resolves(true);
        const bookID = faker.datatype.number();

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;

        stubs[paths.session].get = sinon.fake.returns(false);

        const metadata = {title:faker.lorem.words(), cover:faker.image.image()}

        const content = faker.lorem.paragraphs();

        const bookModule = stubBook(stubs);

        return expect(bookModule.addChapter(bookID, {metadata, content}, reqObj))
            .to.be.rejectedWith(UnauthorizedError);
    });

    it('AddChapter(): Dont call chapterDAL.create if user is not author of book', function() {
        const dalSpy = sinon.fake.resolves(true);

        const stubs = createStubs()
        stubs[paths.chapterDal].create = dalSpy;
        stubs[paths.session].get = sinon.fake.returns(false);

        const metadata = {title:faker.lorem.words(), cover:faker.image.image()}
        const content = faker.lorem.paragraphs();

        const bookModule = stubBook(stubs);

        return expect(
            bookModule.addChapter(faker.datatype.number(), {metadata,content}, faker.datatype.json()))
            .to.be.rejectedWith(UnauthorizedError)
            .then(() => {
                sinon.assert.notCalled(dalSpy);
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

    /**
     * The logic here is that all books returned by fetchAll are published books,
     * so it would be redundant to return the publish status
     */
    it("FetchAll should not return book's publish status", function() {
        const stubs1 = createStubs();

        return stubBook(stubs1).fetchAll()
            .then(res => {
                const returnedBooks = Object.values(res).flat();
                expect(returnedBooks).to.not.be.empty;
                returnedBooks.forEach(bk => {
                    expect(bk).to.not.have.property('published');
                });
            });
    });

    it("FetchAll: Top Free should be only free books", function() {
        const stubs1 = createStubs();

        return stubBook(stubs1).fetchAll()
            .then(res => {
                expect(res).to.have.property('topFree').that.is.an('array');
                res.topFree.forEach(bk => {
                    expect(bk).to.have.property('forSale', false);
                    expect(bk).to.have.property('tokenID', null);
                });
            });
    });

    it("FetchAll: Top Paid should be only paid books", function() {
        const stubs1 = createStubs();

        return stubBook(stubs1).fetchAll()
            .then(res => {
                expect(res).to.have.property('topPaid').that.is.an('array');
                res.topPaid.forEach(bk => {
                    expect(bk).to.have.property('forSale', true);
                    expect(bk).to.have.property('tokenID').that.is.a('number');
                });
            });
    });

    it('FetchAll: should return books that are published', function() {
        const stubs1 = createStubs();
        const unpublished = testData.books.filter(bk => bk.published != true);

        return stubBook(stubs1).fetchAll()
            .then(res => {
                const returnedBooks = Object.values(res).flat();
                expect(returnedBooks).to.not.be.empty;

                returnedBooks.forEach(bk => {
                    unpublished.forEach(pb => {
                        // console.log('pb:', pb, '\nbk:', bk);
                        expect(pb.id).to.not.equal(bk.id);
                    });
                });
            });
    });

    [
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

            const stubs = createStubs({ book: books[0], books });
            const spy = sinon.fake.resolves(users);
            stubs[paths.user].userDal.fetchByIDs = spy;
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
                        expect(b).to.have.property('author');
                        expect(b.author).to.have.property('id', author.id);
                        expect(b.author).to.have.property('username', author.username);
                        expect(b.author).to.have.property('name', author.name);
                        expect(b.author).to.have.keys('id', 'username', 'name');
                    });
                });
        });
    });
});
