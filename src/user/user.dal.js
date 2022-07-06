const db = require('../../config/database')();
const table = 'users';

function normaliseData(data) {
    const rows = (Array.isArray(data)) ? data : [data];

    return rows.map(datum => {
        const { _id, username, password, address } = datum;

        return {
            id: _id,
            ...username && {username},
            ...password && {password},
            ...address && {address},
        }
    });
}

module.exports = {
    create(data) {
        const query = `INSERT INTO ${table} (username, password, address) VALUES($1, $2, $3) RETURNING _id`;
        const values = [data.username, data.password, data.address];

        return db.query(query, values)
            .then(res => normaliseData(res.rows)[0]);
    },

    fetchByID(id) {
        const query = `SELECT * from ${table} WHERE _id=$1`;

        return db.query(query, [id])
            .then(res => normaliseData(res.rows)[0]);
    },

    fetchByUsername(username) {
        const query = `SELECT * FROM ${table} WHERE username=$1`;

        return db.query(query, [username])
            .then(res => normaliseData(res.rows)[0]);
    },

    update(id, data) {
        let query = `UPDATE ${table} SET `;
        let returnQuery = ` RETURNING `;
        const values = [];
        let vIndex = 1;

        for (let key in data) {
            // console.log("Key:", key);
            const value = data[key];

            switch(key) {
                case 'address':
                case 'password':
                    values.push(value);
                    query += ` ${key} = $${vIndex}`;
                    returnQuery += ` ${key}`;
                    vIndex++;
                    break;
            }
        }

        if(values.length == 0)
            return Promise.reject(new Error('data does not contain any valid user data'));

        query += ` WHERE _id=$${vIndex}`;
        values.push(id);

        query += returnQuery;

        // console.log('query:', query);

        return db.query(query, values)
            .then(res => normaliseData(res.rows)[0]);
    },
}
