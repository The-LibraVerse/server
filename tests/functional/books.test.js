const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const request = require('supertest');
const app = require('../../app');
const testData = require('../testData');

describe('Books and chapters', function() {
    it('Create book, chapter, and view created books', function() {
        const user = testData.users[3];
        const newBook = { title: faker.commerce.productName() };
        const { username, password } = user;
        let cookie;

        return request(app).post('/login').send({ username, password })
            .then(res => {
                cookie = res.headers['set-cookie'][0];

                return request(app).post('/books').send(newBook).set('Cookie', cookie)
            }).then(res => {
                expect(res.body).to.have.property('id').that.is.a('number');

                return request(app).get('/books')
            }).then(res => {
                const resOne = res.body.filter(b => b.title == newBook.title);
                expect(res.body).to.have.lengthOf.at.least(30);
                expect(resOne).to.have.lengthOf(1);
                expect(resOne[0]).to.contain(newBook);
                return request(app).get('/my-books/creations').set('Cookie', cookie);
            }).then(res => {
                const resOne = res.body.filter(b => b.title == newBook.title);
                expect(resOne).to.have.lengthOf(1);
                expect(resOne[0]).to.contain(newBook);
            });
    });

    it('View single book', function() {
        const book = testData.books[2];

        return request(app).get('/book/'+book.id)
        .then(res => {
            expect(res.body).to.contain(book);
        });
    });
});
