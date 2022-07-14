const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../../testData');

describe('Testing book module: FetchBook: other', function() {
    const reqObj = JSON.parse(faker.datatype.json());

    it('FetchBook: Do not return publish status if browser is NOT book author', function() {
        const author = 1;
        const published = faker.datatype.boolean();
        const book = {...testData.books[7], author, published };

        const mod1 = stubBook({book}).fetchBook(12, reqObj),
            mod2 = stubBook({getSession: 17, book}).fetchBook(15, reqObj)

        return Promise.all([
            mod1, mod2
        ])
            .then(resArray => {
                resArray.forEach(res => {
                    expect(res).to.not.have.property('published');
                });
            });
    });

    describe('Returning book metadata', function() {
        const author = 12;
        const book = {
            ...testData.books[7], author,
            metadataHash:faker.random.alphaNumeric(20),
            metadataURI:faker.internet.url() 
        }, chapters = testData.chapters.slice(0, 17)
            .map(c => ({...c, bookID: book.id, published:true}));

        const userIsNotAuthorStubs = createStubs({getSession: 15, book, chapters}),
        userUnauthenticatedStubs = createStubs({getSession: false, book, chapters})


        it('FetchBook: Do not return chapter MetadataURI and MetadataHash if browser is not book author', function() {
            return Promise.all([
                stubBook(userIsNotAuthorStubs).fetchBook(12, reqObj),
                stubBook(userUnauthenticatedStubs).fetchBook(15, reqObj)
            ])
                .then(resArray => {
                    resArray.forEach(res => {
                        expect(res.chapters).to.not.be.empty;
                        res.chapters.forEach(ch => {
                            expect(ch).to.not.have.property('metadataURI');
                            expect(ch).to.not.have.property('metadataHash');
                        });
                    });
                });
        });

        it('FetchBook: Do not return chapter publish status if browser is not book author', function() {
            return Promise.all([
                stubBook(userIsNotAuthorStubs).fetchBook(12, reqObj),
                stubBook(userUnauthenticatedStubs).fetchBook(15, reqObj)
            ])
                .then(resArray => {
                    resArray.forEach(res => {
                        expect(res.chapters).to.not.be.empty;
                        res.chapters.forEach(ch => {
                            expect(ch).to.not.have.property('published');
                        });
                    });
                });
        });

        it('FetchBook: Do not return Book MetadataURI and MetadataHash if browser is NOT book author', function() {
            const mod1 = stubBook({book}).fetchBook(12, reqObj),
                mod2 = stubBook({getSession: 17, book}).fetchBook(15, reqObj)

            return Promise.all([
                mod1, mod2
            ])
                .then(resArray => {
                    expect(resArray).to.not.be.empty;
                    resArray.forEach(res => {
                        expect(res).to.not.have.property('metadataURI');
                        expect(res).to.not.have.property('metadataHash');
                    });
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
        const stubs2 = createStubs({getSession: false, book, chapters})

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

    describe('Actions', function() {
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
