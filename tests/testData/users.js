const { faker } = require('@faker-js/faker');
const users  = [];

for(let i=0; i<5; i++) {
    const id = i+1;
    const username = faker.internet.userName();
    const password = faker.internet.password();
    const address = faker.finance.ethereumAddress();

    users.push({
        id,
        username,
        password,
        address,
    });
}

module.exports = users;
