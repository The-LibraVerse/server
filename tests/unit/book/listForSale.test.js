const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../../testData');

describe('Testing book module: Sales', function() {
    const reqObj = JSON.parse(faker.datatype.json());

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
});
