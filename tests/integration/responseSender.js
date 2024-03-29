const { expect } = require('chai');
const { faker } = require('@faker-js/faker');
const testData = require('../testData');
const sinon = require('sinon');
const express = require('express');
const fetch = require('../helpers/fetch');
const responseSender = require('../../middleware/responseSender');
const request = require('supertest');

const routes = require('../../src/routes');

describe('ResponseSender module: integration tests', function() {
    let app;
    beforeEach(() => {
        app = express();
        app.use(responseSender);
    });

    it('If route returns an array, change to object', function() {
        const arr = faker.datatype.array();

        app.get('/', function(req, res) {
            return res.send(arr);
        });

        return request(app).get('/')
        .then(res => {
            expect(res.body).to.have.property('data').that.has.members(arr);
        });
    });

    describe('Route: Fetch Book', function() {
        const route = '/book/3';

        function editRoute(_actions) {
            app.get(routes.fetchBook, function(req, res) {
                return res.send({
                    chapters: testData.chapters,
                    _actions,
                });
            });
        }

        it('If viewing book and data._actions.canSell, add sell link', function() {
            editRoute({canSell: true})

            return request(app).get(route)
                .then(res => {
                    expect(res.body).to.have.property('_links')
                        .that.has.property('sell')
                        .that.is.eql({
                            href: '/book/3/sell',
                            method: 'POST'
                        });
                });
        });

        it('Can create new chapter', function() {
            editRoute({canCreateChapter: true})

            return request(app).get(route)
                .then(res => {
                    expect(res.body).to.have.property('_links')
                        .that.has.property('create_chapter')
                        .that.is.eql({
                            href: '/book/3/chapters',
                            method: 'POST'
                        });
                });
        });

        it('if canViewChapters, return chapter._links._self', function() {
            editRoute({canViewChapters: true})

            return request(app).get(route)
                .then(res => {
                    expect(res.body).to.have.property('chapters').that.is.not.empty;

                    res.body.chapters.forEach(chapter => {
                        expect(chapter).to.have.property('_links')
                            .that.has.property('_self')
                            .that.has.keys('href', 'method')

                        expect(chapter._links._self).to.have.property('href')
                            .that.startsWith('/book/3/chapter/');
                        expect(chapter._links._self.href).to.equal('/book/3/chapter/' + chapter.id);
                        expect(chapter._links._self.href).to.match(/\d+$/);
                        expect(chapter._links._self.href).to.not.contain('undefined');
                        expect(chapter._links._self).to.have.property('method', 'GET')
                    });
                });
        });

        it('if canEdit, return _links.edit', function() {
            editRoute({canEdit: true})

            return request(app).get(route)
                .then(res => {
                    expect(res.body._links).to.have.property('edit')
                        .that.has.property('href');
                    expect(res.body._links.edit).to.have.property('method', 'PUT');
                });
        });

        it('Can publish', function() {
            editRoute({canPublish: true});
            return request(app).get(route)
                .then(res => {
                    expect(res.body).to.have.property('_links')
                        .that.has.property('publish')
                        .that.is.eql({
                            href: '/book/3/publish',
                            method: 'PUT'
                        });
                });
        });
    });

    describe('Route: Fetch chapter', function() {
        const route = '/book/3/chapter/43';

        function editRoute(_actions) {
            app.get(routes.fetchChapter, function(req, res) {
                return res.send({ _actions });
            });
        }

        it('If viewing chapter and data._actions.canSell, add sell link', function() {
            editRoute({ canSell: true, })

            return request(app).get(route)
                .then(res => {
                    expect(res.body).to.have.property('_links')
                        .that.has.property('sell')
                        .that.is.eql({
                            href: '/book/3/chapter/43/sell',
                            method: 'POST'
                        });
                });
        });

        it('if canEdit, return _links.edit', function() {
            editRoute({canEdit: true})

            return request(app).get(route)
                .then(res => {
                    expect(res.body._links).to.have.property('edit')
                        .that.has.property('href');
                    expect(res.body._links.edit).to.have.property('method', 'PUT');
                });
        });

        it('Can publish', function() {
            editRoute({ canPublish: true })
            return request(app).get(route)
                .then(res => {
                    expect(res.body).to.have.property('_links')
                        .that.has.property('publish')
                        .that.is.eql({
                            href: '/book/3/chapter/43/publish',
                            method: 'PUT'
                        });
                });
        });
    });

    describe('Route: User dashboard', function() {
        const route1 = '/user/3/dashboard';
        const route2 = '/dashboard';

        function editRoute(_actions) {
            app.get(routes.dashboard, function(req, res) {
                return res.send({ _actions, });
            });
            app.get(routes.dashboard_self, function(req, res) {
                return res.send({ _actions, });
            });
        }

        it('Can create new book', function() {
            editRoute({canCreateBook: true});

            return Promise.all([
                request(app).get(route1),
                request(app).get(route2),
            ]).then(resArray => {
                expect(resArray).to.not.be.empty;

                resArray.forEach(res => {
                    expect(res.body).to.have.property('_links')
                        .that.has.property('create_book')
                        .that.is.eql({
                            href: '/books',
                            method: 'POST'
                        });
                });
            });
        });
    });
});
