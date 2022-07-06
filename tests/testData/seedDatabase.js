const users = require('./users');
const db = require('../../config/database')();

let promiseChain = db.query(`DELETE FROM users`)
.then(() => db.query(`DELETE FROM books`))

users.forEach(user => {
    const query = `INSERT INTO users(_id, username, password, address) VALUES($1, $2, $3, $4)`;
    const values = [
        user.id, user.username, user.password, user.address
    ];
    
    promiseChain = promiseChain.then(() => db.query(query, values));
});

module.exports = promiseChain;
