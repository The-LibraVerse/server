const dal = require('../../src/books/chapter.dal');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

describe('Chapter data access layer', function() {
    it('Create and FetchByID', function() {
        const title = faker.lorem.words();
        const bookID = 2;
        const content = 'http://bafybeiegytsywwuncpryi4gd46rwsrenopqddkfi23q2igxzwj7k4zlzam.ipfs.localhost:8080/';
        const cover = faker.image.image();

        return dal.create(bookID, content, {title, cover})
            .then(res => {
                expect(res).to.have.property('id').that.is.a('number');
                return dal.fetchByID(bookID, res.id)
            }).then(res => {
                expect(res).to.have.property('title', title);
                expect(res).to.have.property('cover', cover);
                expect(res).to.have.property('bookID', bookID);
                expect(res).to.have.property('contentURL', content);
            });
    });

    it('FetchAll', function() {
        const bookID = 2;
        return dal.fetchAll(bookID)
            .then(res => {
                expect(res).to.have.lengthOf.at.least(8);
            });
    });

    it('Count should take book id and return all chapters with that book id', function() {
        const bookID = 2;
        return dal.fetchCount(bookID)
        .then(res => expect(res).to.be.at.least(8));
    });


    it('multi fetch functions should return the right properties', function() {
        let promiseChain = Promise.resolve();

        [ dal.fetchAll(),
        ].forEach(search => {
            promiseChain = promiseChain.then(() => search)
                .then(res => {
                    expect(res).to.have.lengthOf.at.least(30);

                    res.forEach(b => {
                        expect(b).to.have.keys('id', 'title', 'author');
                        expect(b.id).to.be.a('number');
                        expect(b.title).to.be.a('string');
                        expect(b.author).to.be.a('number');
                    });
                });
        });
    });
});
