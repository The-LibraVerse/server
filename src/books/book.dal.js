const db = require('../../config/database')();
const table = 'books';

function normaliseResult(data) {
    let returnObj = false;
    if(!Array.isArray(data)) {
        data = [data];
        returnObj = true;
    }

    return data.map(datum => {
        const { _id, title } = datum;
        return {
            id: _id,
            ...title && {title},
        }
    });
}

module.exports = {
    create(data) {
        const query = `INSERT INTO ${table} (title) VALUES($1) RETURNING *`;
        const values = [data.title];

        return db.query(query, values)
        .then(res => {
            return normaliseResult(res.rows)[0];
        });
    },

    fetchByID(id) {
        const query = `SELECT * from ${table} where _id=$1`;
        const values = [id];

        return db.query(query, values)
        .then(res => normaliseResult(res.rows)[0]);
    },
}
