const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../../testData');
const code = require('../../../src/codes');

describe('Testing book module: FetchBook when user is author', function() {
    const reqObj = JSON.parse(faker.datatype.json());
    const author = 1;

    let bookModule, book = testData.books[9], chapters;

    beforeEach(() => {
        book = testData.books[9];
        book.author = author;

        chapters = testData.chapters;

        bookModule = stubBook({getSession: author, book, chapters})
    })

    function setupStubModuleWithTestCase(testCase={}) {
        const bookIndex = faker.datatype.number(29);
        book = testCase.book || testData.books[9];
        book.author = author;
        let getSession = {} 
        if(testCase.session)
            getSession = testCase.session;

        getSession.userID = author;

        const stubs = createStubs({getSession, book, chapters})

        return stubBook(stubs);
    }

    const testCases = [
        {title: 'If book is published', book: {...book, published: true}},
        {title: 'If book has metadata', book: {...book, metadataHash: faker.random.alphaNumeric()}},
        {title: 'If book has no metadata hash', book: {...book, metadataHash: null}},
        {title: 'If book has no metadata hash', book: {...book, metadataHash: undefined}},
        {title: 'If book is for sale', book: {...book, forSale:true, tokenID: 4, tokenContract:faker.finance.ethereumAddress() }},
        {title: 'If book is for sale and author has addr in session', book: {...book, forSale:true, tokenID: 4,
            tokenContract:faker.finance.ethereumAddress()}, session: {address: faker.finance.ethereumAddress()} },
        {title: 'If book is not for sale', book: {...book, forSale:false}},
    ]

    testCases.forEach(testCase => {
        it('FetchBook returns all properties: ' + testCase.title, function() {
            const stubbedBookModule = setupStubModuleWithTestCase(testCase);

            return stubbedBookModule.fetchBook(15, reqObj)
                .then(res => {
                    expect(res).to.have.keys('id', 'title', 'description', 'cover', 'published', 'metadataURI', 'metadataHash',
                        'author', 'chapters', 'totalChapters', 'forSale', 'tokenID', 'tokenContract',
                        '_actions'
                    );

                    expect(res.chapters).to.not.be.empty;
                });
        });
    });

    testCases.forEach(testCase => {
        it('FetchBook returns all chapters and their details: ' + testCase.title, function() {
            const stubbedBookModule = setupStubModuleWithTestCase(testCase);

            return stubbedBookModule.fetchBook(15, reqObj)
                .then(res => {
                    expect(res.chapters).to.not.be.empty;
                    res.chapters.forEach(chapter => {
                        expect(chapter).to.have.keys('id', 'title', 'cover', 'published', 'metadataURI', 'metadataHash',
                            'forSale', 'tokenID', 'tokenContract', 'contentURL'
                            // '_actions'
                        );
                    });
                    expect(res.chapters.map(c => c.id))
                        .to.have.members(chapters.map(c => c.id));
                });
        });
    });

    testCases.forEach(testCase => {
        it('FetchBook returns all actions: ' + testCase.title, function() {
            const stubbedBookModule = setupStubModuleWithTestCase(testCase);

            return stubbedBookModule.fetchBook(15, reqObj)
                .then(res => {
                    expect(res._actions).to.have.keys(
                        'canSell', 'canPublish', 'canView', 'canViewChapters',
                        'canCreateChapter', 'canEdit'
                    );
                    expect(res._actions).to.have.property('canView', true);
                    expect(res._actions).to.have.property('canViewChapters', true);
                });
        });
    });

    describe('Notices', function() {
        testCases.forEach(testCase => {
            it('FetchBook should never return a ' + code.tokenRequired + ' to author: ' + testCase.title, function() {
                const stubbedBookModule = setupStubModuleWithTestCase(testCase);

                return stubbedBookModule.fetchBook(15, reqObj)
                    .then(res => {
                        const notice = res.notice || res._notice || res.notices || res._notices;

                        if(notice)
                            expect(notice).to.not.have.property('code', code.tokenRequired);
                    });
            });
        });
    });

    describe('Actions', function() {
        it('FetchBook - CanSell = true: if browser is book author', function() {
            const author = 1;
            const book = {...testData.books[7], author, published: true };

            const stubs = createStubs({getSession: author, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canSell', true);
                });
        });

        it('FetchBook - CanSell = false: if book is for sale', function() {
            const author = 1;
            const book = testData.books.filter(b => {
                return b.published && b.tokenID && b.forSale && /^0x[\w\d]+$/.test(b.tokenContract);
            })[0];

            const stubs = createStubs({getSession: author, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canSell', false);
                });
        });

        it('FetchBook - CanCreateChapter = true: if browser is book author', function() {
            const author = 1;
            const book = {...testData.books[7], author, published: true };

            const stubs = createStubs({getSession: author, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canCreateChapter', true);
                });
        });


        it('FetchBook - CanSell = false: if book is not published', function() {
            const author = 1;
            const bookID = 42
            const book = {...testData.books[7], author, published: false };

            const stubs1 = createStubs({getSession: author, book})

            return stubBook(stubs1).fetchBook(bookID)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canSell', false);
                });
        });

        it('FetchBook - CanPublish: return true if author is book is not published', function() {
            const user = 15;
            const book = {...testData.books[7], author:user, published: false };

            const stubs = createStubs({getSession: user, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canPublish', true);
                });
        });

        it('FetchBook - CanPublish: return false if book is already published', function() {
            const user = 15;
            const book = {...testData.books[7], author:user, published: true };

            const stubs = createStubs({getSession: user, book})

            return stubBook(stubs).fetchBook(12)
                .then(res => {
                    expect(res).to.have.property('_actions')
                        .that.has.property('canPublish', false);
                });
        });
    });
});
