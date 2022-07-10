const db = require('../../config/database')();
const table = 'books';

function normaliseResult(data) {
    let returnObj = false;
    if(!Array.isArray(data)) {
        data = [data];
        returnObj = true;
    }

    return data.map(datum => {
        const { _id, title, author } = datum;
        return {
            id: _id,
            ...title && {title},
            ...author && {author},
        }
    });
}

module.exports = {
    create(data) {
        const query = `INSERT INTO ${table} (title, author) VALUES($1, $2) RETURNING *`;
        const values = [data.title, data.author];

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

    fetchAuthorID(id) {
        const query = `SELECT author from ${table} where _id=$1`;
        const values = [id];

        return db.query(query, values)
            .then(res => {
                if(res.rows[0])
                    return res.rows[0].author;
                else return null;
            });
    },

    fetchAll() {
        const query = `SELECT * FROM ${table}`;

        return db.query(query)
            .then(res => normaliseResult(res.rows));
    },

    fetchByCreator(id) {
        const query = `SELECT * FROM ${table} WHERE author=$1`;
        const values = [id];

        return db.query(query, values)
            .then(res => normaliseResult(res.rows));
    }
}
