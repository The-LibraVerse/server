const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');
const { createStubs, stubBook, paths } = require('./book.stubs');
const testData = require('../../testData');

describe('Testing book module: FetchChapter', function() {
    const reqObj = JSON.parse(faker.datatype.json());

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
});
