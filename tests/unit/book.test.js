const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../testData');

describe('Testing book module', function() {
    const reqObj = JSON.parse(faker.datatype.json());

    it('Create(): Check session manager for author id', function() {
        const userID = faker.datatype.number();
        const spy = sinon.fake.resolves(true);

        const stubs = createStubs({getSession: userID});
        stubs[paths.bookDal].create = spy;

        const sessionManagerSpy = stubs[paths.session].get;

        const book = stubBook(stubs)
        const data = { name: faker.commerce.productName() }

        return book.create(data, reqObj)
            .then(() => {
                sinon.assert.calledWith(spy, sinon.match.has('author', userID));
                sinon.assert.calledWith(sessionManagerSpy, reqObj);
            });
    });

    it('Book.Create should throw if user is not logged in', function() {
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

    it('List[Book]ForSale: fail if user is not author of book', function() {
        const tokenDeets = {
            contract: faker.finance.ethereumAddress(), tokenID: 3};

        const stubs1 = createStubs();
        const bookUpdateSpy1 = stubs1[paths.bookDal].update;
        const bookModule1 = stubBook(stubs1);

        const stubs2 = createStubs({ author: 59, getSession: 89});
        const bookUpdateSpy2 = stubs2[paths.bookDal].update;
        const bookModule2 = stubBook(stubs2);

        return expect(bookModule1.listForSale(faker.datatype.number(), tokenDeets, reqObj))
            .to.be.rejectedWith(UnauthorizedError)
            .then(() => expect(bookModule2.listForSale(faker.datatype.number(), tokenDeets, reqObj))
                .to.be.rejectedWith(UnauthorizedError))
            .then(() => {
                sinon.assert.notCalled(bookUpdateSpy1);
                sinon.assert.notCalled(bookUpdateSpy2);
            });
    });

    it('List[Book]ForSale: be fulfilled if user is book\'s author', function() {
        const tokenDeets = {
            contract: faker.finance.ethereumAddress(), tokenID: 3};

        const stubs = createStubs({ author: 59, getSession: 59});
        const bookModule1 = stubBook(stubs);

        return bookModule1.listForSale(faker.datatype.number(), tokenDeets, reqObj)
            .then(res => {
                sinon.assert.called( stubs[paths.bookDal].update );
            });
    });

    it('ListChapterForSale: fail if user is not author of book', function() {
        const tokenDeets = {
            contract: faker.finance.ethereumAddress(), tokenID: 3};

        const stubs1 = createStubs({author: 50, getSession: 105 });
        const updateChapterSpy1 = stubs1[paths.chapterDal].update;
        const bookModule1 = stubBook(stubs1);

        const stubs2 = createStubs({author: 50, getSession: false });
        const updateChapterSpy2 = stubs2[paths.chapterDal].update;
        const bookModule2 = stubBook(stubs2);

        return expect(bookModule1.listChapterForSale(faker.datatype.number(), tokenDeets, reqObj))
            .to.be.rejectedWith(UnauthorizedError)

            .then(() => expect(bookModule2.listChapterForSale(faker.datatype.number(), tokenDeets, reqObj))
                .to.be.rejectedWith(UnauthorizedError))

            .then(() => {
                sinon.assert.notCalled(updateChapterSpy1);
                sinon.assert.notCalled(updateChapterSpy2);
            });
    });

    it('ListChapterForSale: be fulfilled if user is book\'s author', function() {
        const tokenDeets = {
            contract: faker.finance.ethereumAddress(), tokenID: 3};

        const stubs = createStubs({author: 50, getSession: 50 });
        const chapterUpdateSpy = stubs[paths.chapterDal].update;
        const bookModule = stubBook(stubs);

        return bookModule.listChapterForSale(faker.datatype.number(), tokenDeets, reqObj)
        .then(res => {
            sinon.assert.called(chapterUpdateSpy);
        });
    });

    it('FetchBook: Return publish status if browser is book author', function() {
        const author = 1;
        const published = faker.datatype.boolean();
        // const published = true;
        const book = {...testData.books[7], author, published };

        const stubs1 = createStubs({getSession: author, book})
        const stubs2 = createStubs({getSession: author, book})

        return Promise.all([
            stubBook(stubs1).fetchBook(12, reqObj),
            stubBook(stubs2).fetchBook(15, reqObj)
        ])
            .then(resArray => {
                resArray.forEach(res => {
                    expect(res).to.have.property('published', published);
                });
            });
    });

    it('FetchBook: Do not eturn publish status if browser is book author', function() {
        const author = 1;
        const published = faker.datatype.boolean();
        const book = {...testData.books[7], author, published };

        const stubs1 = createStubs({getSession: 17, book})
        const stubs2 = createStubs({getSession: 17, book})

        const mod1 = stubBook(stubs1).fetchBook(12, reqObj),
            mod2 = stubBook(stubs2).fetchBook(15, reqObj)

        return Promise.all([
            mod1, mod2
        ])
            .then(resArray => {
                resArray.forEach(res => {
                    expect(res).to.not.have.property('published');
                });
            });
    });

    it('FetchBook: Return all chapters, published and unpublished, if browser is book author', function() {
        const author = 1;
        const published = faker.datatype.boolean();

        const pubChapters = testData.chapters.slice(0, 10)
        .map(c => ({...c, published: true}));

        const unpubChapters = testData.chapters.slice(30, 50)
        .map(c => ({ ...c, published: false }));

        const chapters = [...pubChapters, ...unpubChapters];

        const book = {...testData.books[7], author, published };

        const stubs1 = createStubs({getSession: author, book, chapters})
        const stubs2 = createStubs({getSession: author, book, chapters})

        return Promise.all([
            stubBook(stubs1).fetchBook(12, reqObj),
            stubBook(stubs2).fetchBook(15, reqObj)
        ])
            .then(resArray => {
                resArray.forEach(res => {
                    expect(res.chapters).to.not.be.empty;

                    const pubIDs = pubChapters.map(c => c.id);

                    expect(res.chapters.map(c => c.id))
                        .to.have.members([
                            ...pubChapters.map(c => c.id),
                            ...unpubChapters.map(c => c.id)
                        ]);

                    expect(res.chapters).to.not.be.empty;
                });
            });
    });

    it('FetchBook: Do not return unpublished chapters if browser is not author', function() {
        const author = 1;
        const published = faker.datatype.boolean();
        const book = {...testData.books[7], author, published };

        const pubChapters = testData.chapters.slice(0, 10)
        .map(c => ({...c, published: true}));

        const unpubChapters = testData.chapters.slice(30, 50)
        .map(c => ({ ...c, published: false }));

        const chapters = [...pubChapters, ...unpubChapters];

        const stubs1 = createStubs({getSession: 17, book, chapters})
        const stubs2 = createStubs({getSession: 17, book, chapters})

        const mod1 = stubBook(stubs1).fetchBook(12, reqObj),
            mod2 = stubBook(stubs2).fetchBook(15, reqObj)

        return Promise.all([
            mod1, mod2
        ])
            .then(resArray => {
                resArray.forEach(res => {
                    expect(res.chapters).to.not.be.empty;

                    expect(res.chapters.map(c => c.id))
                        .to.have.members(pubChapters.map(c => c.id));

                    expect(res.chapters.map(c => c.id))
                        .to.not.have.members(unpubChapters.map(c => c.id));
                    expect(res.chapters.map(c => c.id))
                        .to.not.include.members(unpubChapters.map(c => c.id));

                    expect(res.chapters.map(c => c.id))
                        .to.not.have.members(chapters.map(c => c.id));
                    expect(res.chapters.map(c => c.id))
                        .to.not.include.members(chapters.map(c => c.id));
                });
            });
    });

    it('FetchChapter(): Return content url and metadata url if browser is book author', function() {
        const author = testData.users[0];
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

    it('FetchChapter(): Call fn for external fetches to get chapter content', function() {
        const chapter = testData.chapters[4];

        const spy = sinon.fake.resolves(chapter._content);

        const stubs = createStubs()
        stubs[paths.fetchExternal].fetch = spy;
        stubs[paths.chapterDal].fetchByID = sinon.fake.resolves(chapter);

        const book = stubBook(stubs);

        return book.fetchChapter(faker.datatype.number(), faker.datatype.number())
            .then(res => {
                sinon.assert.calledWith(spy, chapter.contentURL);
            });
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

    it('FetchBook: should return chapters[] content urls if book author is browsing', function() {
        const author = 1;
        const bookID = 42
        const book = {...testData.books[7], author };

        const chapters = testData.chapters.slice(1,5);

        const stubs = createStubs({getSession: author})
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);
        stubs[paths.chapterDal].fetchAll = sinon.fake.resolves(chapters);

        const bookModule = stubBook(stubs);

        return bookModule.fetchBook(bookID)
            .then(res => {
                expect(res).to.have.property('chapters').that.has.lengthOf(chapters.length);
                res.chapters.forEach((c, i) => {
                    expect(c).to.have.property('contentURL', chapters[i].contentURL);
                });
            });
    });

    it('FetchBook: do not  return chapters[] content urls if user is not book author', function() {
        const author = 1;
        const bookID = 42
        const book = {...testData.books[7], author };

        const chapters = testData.chapters.slice(1,5).map(c => {
            return {
                ...c,
                published: true
            }
        });

        // console.log('chaptrs:', chapters);

        const stubs = createStubs({getSession: faker.random.numeric(2)})
        stubs[paths.bookDal].fetchByID = sinon.fake.resolves(book);
        stubs[paths.chapterDal].fetchAll = sinon.fake.resolves(chapters);

        const bookModule = stubBook(stubs);

        return bookModule.fetchBook(bookID)
            .then(res => {
                expect(res).to.have.property('chapters').that.has.lengthOf(chapters.length);
                res.chapters.forEach((c, i) => {
                    expect(c).to.not.have.property('contentURL');
                });
            });
    });

    describe.only('Book is for sale', function() {
        it('FetchBook: user has token');

        it('FetchBook: user has not token');

        it("FetchBook: do not return any of book's chapters")

        it("FetchChapter: user does not have book token so do not return chapter's content, or url");
    });

    /**
     * The logic here is that all books returned by fetchAll are published books,
     * so it would be redundant to return the publish status
     */
    it("FetchAll should not return book's publish status", function() {
        const stubs1 = createStubs();

        return stubBook(stubs1).fetchAll()
            .then(res => {
                expect(res).to.not.be.empty;
                res.forEach(bk => {
                    expect(bk).to.not.have.property('published');
                });
            });
    });

    it('FetchAll: should return books that are published', function() {
        const stubs1 = createStubs();
        const unpublished = testData.books.filter(bk => bk.published != true);

        return stubBook(stubs1).fetchAll()
            .then(res => {
                res.forEach(bk => {
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

    describe('Actions', function() {
        it('FetchBook - Published: return canSell if browser is book author', function() {
            const author = 1;
            const book = {...testData.books[7], author, published: true };

            const stubs = createStubs({getSession: author, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canSell', true);
                });
        });

        it('FetchBook - Published: do not return canSell if browser is not book author', function() {
            const id = 42
            const book = {...testData.books[7], id, author:1, published: true };

            const stubs = createStubs({getSession: 13, book})

            return stubBook(stubs).fetchBook(id)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.does.not.have.property('canSell', true);
                });
        });

        it('FetchBook - Unpublished: do not return canSell if book is not published', function() {
            const author = 1;
            const bookID = 42
            const book = {...testData.books[7], author, published: false };

            const stubs1 = createStubs({getSession: author, book})

            return stubBook(stubs1).fetchBook(bookID)
                .then(res => {
                    expect(res, 'browser is author').to.have.property('_actions')
                        .that.does.not.have.property('canSell');

                    const stubs2 = createStubs({getSession: 5, book})
                    return stubBook(stubs2).fetchBook(bookID)
                })
                .then(res => {
                    expect(res, 'browser is not author').to.have.property('_actions')
                        .that.does.not.have.property('canSell');
                });
        });

        it('FetchBook - CanPublish: return true if author is browsing and book is unpublished', function() {
            const user = 15;
            const book = {...testData.books[7], author:user, published: false };

            const stubs = createStubs({getSession: user, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canPublish', true);
                });
        });

        it('FetchBook - CanPublish: return false if author is browsing and book is already published', function() {
            const user = 15;
            const book = {...testData.books[7], author:user, published: true };

            const stubs = createStubs({getSession: user, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.does.not.have.property('canPublish');
                });
        });

        it('FetchBook - CanPublish: dont return canPublish if browser is not author', function() {
            const user = 15;
            const book1 = {...testData.books[7], author:33, published: false };

            const stubs1 = createStubs({getSession: user, book:book1})

            return stubBook(stubs1).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.does.not.have.property('canPublish');

                    const book2 = {...testData.books[7], author:33, published: true };
                    const stubs2 = createStubs({getSession: user, book:book2})

                    return stubBook(stubs2).fetchBook(12)
                }).then(res => {
                    expect(res).to.have.property('_actions')
                        .that.does.not.have.property('canPublish');

                });
        });
    });

});
