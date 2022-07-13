const router = require('express').Router();
const book = require('./books/book');
const { user } = require('./user');
const errorHandler = require('./errorHandler');
const routes = require('./routes');

router.get(routes.auth, function(req, res, next) {
    return user.checkAuth(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get(routes.dashboard, function(req, res, next) {
    return user.dashboard(req.params.user_id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get(routes.dashboard_self, function(req, res, next) {
    return user.dashboard(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.post(routes.signup, function(req, res, next) {
    return user.signup(req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.post(routes.login, function(req, res, next) {
    return user.login(req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.delete(routes.logout, function(req, res, next) {
    return user.logout(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/user', function(req, res, next) {
    return user.fetch(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/user/:user_id', function(req, res, next) {
    return user.fetch(req.params.user_id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

// TODO: User dashboard

/**
 * BOOKS
 */

router.post(routes.createBook, function(req, res, next) {
    return book.create(req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/** Fetch single book
 */
router.get(routes.fetchBook, function(req, res, next) {
    return book.fetchBook(req.params.book_id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/** Add book to library
 */
router.get('/book/:book_id/add-to-library', function(req, res, next) {
    return book.addToLibrary(req.params.book_id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

// Publish book
router.put(routes.publishBook, function(req, res, next) {
    return book.publish(req.params.book_id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

// Publish chapter
router.put(routes.publishChapter, function(req, res, next) {
    return book.publishChapter(req.params.chapter_id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get(routes.fetchBooks, function(req, res, next) {
    return book.fetchAll()
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/my-books', function(req, res, next) {
    return book.userBooks(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/my-books/creations', function(req, res, next) {
    return book.createdBy(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/user/:user_id/books', function(req, res, next) {
    return book.userBooks(req.params.user_id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/user/:user_id/books/creations', function(req, res, next) {
    return book.createdBy(req.params.user_id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.post('/book/:book_id/sell', function(req, res, next) {
    return book.listForSale(req.params.book_id, req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.post('/book/:book_id/chapter/:chapter_id/sell', function(req, res, next) {
    return book.listChapterForSale(req.params.chapter_id, req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/**
 * CHAPTERS
 */
/** Create chapter
 */
router.post(routes.createChapter, function(req, res, next) {
    return book.addChapter(req.params.book_id, req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/** Get chapter
 */
router.get(routes.fetchChapter, function(req, res, next) {
    return book.fetchChapter(req.params.book_id, req.params.chapter_id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.delete('/book/:book_id/chapter/chapter_id', function(req, res, next) {
    return book.deleteChapter(req.params.book_id, req.params.chapter_id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

module.exports = router;
