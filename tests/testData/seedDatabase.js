const users = require('./users');
const books = require('./books');
const db = require('../../config/database')();

let promiseChain = db.query(`DELETE FROM books`)
    .then(() => db.query(`DELETE FROM chapters`))
    .then(() => db.query(`DELETE FROM users`))

users.forEach(user => {
    const query = `INSERT INTO users(_id, username, password, address) VALUES($1, $2, $3, $4)`;
    const values = [
        user.id, user.username, user.password, user.address
    ];
    
    promiseChain = promiseChain.then(() => db.query(query, values));
});

books.forEach(book => {
    const query = `INSERT INTO books(_id, title, author) VALUES ($1, $2, $3)`;
    const values = [
        book.id, book.title, book.author
    ];
    
    promiseChain = promiseChain.then(() => db.query(query, values));
});

module.exports = promiseChain;
