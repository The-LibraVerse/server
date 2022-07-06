const router = require('express').Router();
const book = require('./books/book');
const { user } = require('./user');
const errorHandler = require('./errorHandler');

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

router.post('/books', function(req, res, next) {
    return book.create(req.body)
    .then(payload => res.send(payload))
    .catch(e => next(e));
});

router.delete('/book/:book_id/chapter/chapter_id', function(req, res, next) {
    return book.delete(req.params.book_id, req.params.chapter_id)
    .then(payload => res.send(payload))
    .catch(e => next(e));
});

module.exports = router;
