const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const request = require('supertest');
const app = require('../../app');

describe('Auth and user flow', function() {
    [
        {title: 'username and password',
            data: {username: faker.internet.userName(), password: faker.internet.password()}},
        {title: 'with ethereum address', data: {address: faker.finance.ethereumAddress()}}
    ].forEach(testArgs => {
        it('Sign up with ' + testArgs.title + ' should return cookie', function() {
            let cookie;

            return request(app).post('/signup').send(testArgs.data)
                .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.headers).to.have.property('set-cookie');
                    expect(res.headers['set-cookie'][0]).to.have.string('libraverse.cookie');
                    expect(res.body).to.have.property('id').that.is.a('number');

                    return request(app).post('/login').send(testArgs.data)
                })
                .then(res => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.not.have.property('error');
                    expect(res.headers).to.have.property('set-cookie');
                    expect(res.headers['set-cookie'][0]).to.have.string('libraverse.cookie');
                });
        });
    });

    it('Sign up with username and password, and update with ethereum address');
});
