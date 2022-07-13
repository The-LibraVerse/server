const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../../testData');

describe('Testing book module: Viewing books/chapters that are for sale', function() {
    const reqObj = JSON.parse(faker.datatype.json());

    describe('Book is for sale', function() {
        const author = testData.users[7],

            book = {...testData.books[8],
                author: author.id,
                published:true, forSale:true,
                tokenID: faker.datatype.number(),
                tokenContract: faker.finance.ethereumAddress(),
            },
            chapters = testData.publishedChapters;


        it('FetchBook: If user has token, return other chapter details', function() {
            const user = testData.users[13];

            const bookModule = stubBook({ book, getSession: user, erc1155:1 });

            return bookModule.fetchBook(book.id)
                .then(res => {
                    expect(res).to.have.property('chapters');
                    expect(res.chapters).to.not.be.empty;

                    res.chapters.forEach(ch => {
                        expect(ch).to.include.keys('id', 'title');
                    });
                });
        });

        it('FetchBook: If user has token, do not return _message or _code', function() {
            const user = testData.users[17];
            const bookModule = stubBook({ book, getSession: user, erc1155:1 });

            return bookModule.fetchBook(book.id)
                .then(res => {
                    expect(res).to.not.have.property('_message');
                    expect(res).to.not.have.property('_code');
                });
        });

        // TODO: if book is for sale and user does not have book token,
        // do not return chapter view links,
        // and do not return chapter ids --- DONE
        // Can return chapter titles. ---DONE
        // Configure frontend to use chapter links to view chapters.
        // Return a _message and a _code telling the user that they need
        // to purchase the book's token to view the book.
        it('FetchBook: If user does not have token, only return chapter titles', function() {
            const user = testData.users[17];

            const bookModule = stubBook({ book, getSession: user });

            return bookModule.fetchBook(book.id)
                .then(res => {
                    expect(res).to.have.property('chapters');
                    expect(res.chapters).to.not.be.empty;

                    res.chapters.forEach(ch => {
                        expect(ch).to.have.keys('id', 'title', 'tokenContract', 'tokenID');
                    });
                });
        });

        it('FetchBook: If user does not have token, actions should be false', function() {
            const user = testData.users[17];

            const bookModule = stubBook({ book, getSession: user });

            return bookModule.fetchBook(book.id)
                .then(res => {
                    expect(res).to.have.property('_actions');
                    expect(res._actions).to.have.property('canView', false);
                    expect(res._actions).to.have.property('canViewChapters', false);
                });
        });

        it('FetchBook: If user does not have token, return message telling user to buy book token', function() {
            const user = testData.users[17];

            const bookModule = stubBook({ book, getSession: user });

            return bookModule.fetchBook(book.id)
                .then(res => {
                    expect(res).to.have.property('_message').that.is.a('string').that.is.not.empty;
                    expect(res).to.have.property('_code').that.is.a('string').that.is.not.empty;
                });
        });

        it("FetchBook: do not return any of book's chapters")
    });
});
