const users = require('./users');

module.exports = function() {
    const randIndex = Math.floor(Math.random() * users.length);

    return users[randIndex];
}

