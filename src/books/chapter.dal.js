const db = require('../../config/database')();
const table = 'chapters';

function normaliseResult(data) {
    let returnObj = false;
    if(!Array.isArray(data)) {
        data = [data];
        returnObj = true;
    }

    return data.map(datum => {
        const { _id, content_ipfs_url: contentURL, title, cover, book_id: bookID, author } = datum;
        return {
            id: _id,
            ...contentURL && {contentURL},
            ...title && {title},
            ...cover && {cover},
            ...bookID && {bookID},
        }
    });
}

function fetchCountForBook(bookID) {
    if(!bookID)
        return new Promise.reject( new Error('book id missing'));

    const query = `SELECT count(*) FROM ${table} where book_id=$1`;
    const values = [bookID];

    return db.query(query, values)
        .then(res => parseInt(res.rows[0].count));
}

module.exports = {
    /**
     * content should be an ipfs url or hash
     */
    create(bookID, contentURL, metadata) {
        const query = `INSERT INTO ${table}(book_id, content_ipfs_url, title, cover) VALUES($1, $2, $3, $4) RETURNING _id`;
        const values = [
            bookID, contentURL, metadata.title, metadata.cover
        ]

        return db.query(query, values)
            .then(res => normaliseResult(res.rows)[0]);
    },

    fetchByID(bookID, chapterID) {
        const query = `SELECT * FROM ${table} WHERE book_id=$1 AND _id=$2`;
        const values = [
            bookID, chapterID
        ]

        return db.query(query, values)
            .then(res => normaliseResult(res.rows)[0]);
    },

    fetchAll(bookID) {
        if(!bookID)
            return Promise.reject( new Error('book id missing'));

        const query = `SELECT * FROM ${table} where book_id=$1`;
        const values = [bookID];

        return db.query(query, values)
            .then(res => normaliseResult(res.rows));
    },

    fetchCount: fetchCountForBook,

    fetchCountForBook,

    deleteChapter(id) {
    }
}
