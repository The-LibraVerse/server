const { faker } = require('@faker-js/faker');
const users  = [
    {username: 'asdf', password: 'password123'},
    {username: 'asdf2', password: 'asdf'},
];

for(let i=0; i<5; i++) {
    const user = users[i] || {};

    const id = i+1;
    const username = user.username || faker.internet.userName();
    const password = user.password || faker.internet.password();
    const address = user.address || faker.finance.ethereumAddress();

    users[i] = {
        id,
        username,
        password,
        address,
    };
}

module.exports = users;
