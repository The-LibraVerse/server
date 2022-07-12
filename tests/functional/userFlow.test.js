const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const request = require('supertest');
const app = require('../../app');
const testData = require('../testData');

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

    it('Login and logut', function() {
        const { username, password } = testData.users[3];
        let cookie;

        const data = { username, password }

        return request(app).post('/login').send(data)
            .then(res => {
                cookie = res.headers['set-cookie'][0];
                return request(app).get('/auth').set('Cookie', cookie)
            }).then(res => {
                expect(res.body).to.eql({logged_in: true});

                return request(app).delete('/logout').set('Cookie', cookie)
            })
            .then(res => {
                // console.log('headers:', res.headers);
                expect(res.headers).to.have.property('clear-site-data', '"cookies"');
                return request(app).get('/auth').set('Cookie', cookie)
            })
            .then(res => {
                expect(res.body).to.eql({logged_in: false});
            });
    });

    it('Auth route: Return false if user is not logged in', function() {
        return request(app).get('/auth')
            .then(res => {
                expect(res.body).to.eql({logged_in: false});
            });
    })

    it('Auth route: Return true if user is logged in', function() {
        return request(app).post('/login').send(testData.users[0])
            .then(res => {
                const cookie = res.headers['set-cookie'][0];
                return request(app).get('/auth').set('Cookie', cookie)
            })
            .then(res => {
                expect(res.body).to.eql({logged_in: true});
            });
    })

    it('Sign up with username and password, and update with ethereum address');
});
