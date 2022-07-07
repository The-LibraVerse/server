const { faker } = require('@faker-js/faker');
const users  = [
    {username: 'asdf', password: 'password123'},
    {username: 'asdf2', password: 'asdf'},
];

for(let i=0; i<30; i++) {
    const user = users[i] || {};

    const id = i+1;
    const name = user.name || faker.internet.userName();
    const username = user.username || faker.internet.userName();
    const password = user.password || faker.internet.password();
    const address = user.address || faker.finance.ethereumAddress();

    users[i] = {
        id,
        name,
        username,
        password,
        address,
    };
}

module.exports = users;
