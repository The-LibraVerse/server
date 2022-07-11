const router = require('express').Router();
const book = require('./books/book');
const { user } = require('./user');
const errorHandler = require('./errorHandler');

router.get('/auth', function(req, res, next) {
    return user.checkAuth(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.post('/signup', function(req, res, next) {
    return user.signup(req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.post('/login', function(req, res, next) {
    return user.login(req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/user', function(req, res, next) {
    return user.fetch(req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/user/:id', function(req, res, next) {
    return user.fetch(req.params.id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.post('/books', function(req, res, next) {
    return book.create(req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/** Fetch single book
 */
router.get('/book/:id', function(req, res, next) {
    return book.fetchBook(req.params.id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/** Add book to library
 */
router.get('/book/:id/add-to-library', function(req, res, next) {
    return book.addToLibrary(req.params.id, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/** Create chapter
 */
router.post('/book/:id/chapter', function(req, res, next) {
    return book.addChapter(req.params.id, req.body, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

/** Get chapter
 */
router.get('/book/:bookID/chapter/:chapterID', function(req, res, next) {
    console.log('params:', req.params);
    return book.fetchChapter(req.params.bookID, req.params.chapterID, req)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/books', function(req, res, next) {
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

router.get('/user/:id/books', function(req, res, next) {
    return book.userBooks(req.params.id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.get('/user/:id/books/creations', function(req, res, next) {
    return book.createdBy(req.params.id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

router.delete('/book/:book_id/chapter/chapter_id', function(req, res, next) {
    return book.delete(req.params.book_id, req.params.chapter_id)
        .then(payload => res.send(payload))
        .catch(e => next(e));
});

module.exports = router;
