const dal = require('../../src/books/book.dal');
const { faker } = require('@faker-js/faker');
const { expect } = require('chai');

describe('Book data access layer', function() {
    it('Create and FetchByID', function() {
        const title = faker.lorem.words();

        return dal.create({title})
        .then(res => {
            expect(res).to.have.property('id').that.is.a('number');
            return dal.fetchByID(res.id)
        }).then(res => {
            expect(res).to.have.property('title', title);
        });
    });
});
