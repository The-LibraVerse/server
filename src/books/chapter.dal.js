const db = require('../../config/database')();
const table = 'chapters';

const columnAliases = {
    title: 'title',
    cover: 'cover',
    published: 'published',
    metadataHash: 'metadata_hash',
    metadataURI: 'metadata_uri',
}

function normaliseResult(data) {
    let returnObj = false;
    if(!Array.isArray(data)) {
        data = [data];
        returnObj = true;
    }

    return data.map(datum => {
        const { _id, content_ipfs_url: contentURL, title, cover,
            book_id:bookID, author,
            published, for_sale:forSale,
            metadata_uri:metadataURI, metadata_hash:metadataHash  } = datum;

        return {
            id: _id,
            ...contentURL && {contentURL},
            ...title && {title},
            ...cover && {cover},
            ...bookID && {bookID},
            ...(published != null) && {published},
            ...(forSale != null) && {forSale},
            ...metadataURI && {metadataURI},
            ...metadataHash && {metadataHash},
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

    update(id, data) {
        // const columns = ['title', 'cover', 'metadataHash'];
        const values = [id];

        let i = 2;
        let setColStr = '';

        for(let alias in columnAliases) {
            if(data[alias]) {
                if(i > 2)
                    setColStr += ', ';

                values.push(data[alias]);
                setColStr += ' '  + columnAliases[alias] + ' = $' + i;
                i++;
            }
        }

        const query = `UPDATE ${table}
            SET ${setColStr}
        WHERE _id = $1 RETURNING *`;

        return db.query(query, values)
            .then(res => {
                return normaliseResult(res.rows)[0];
            });
    },

    fetchByID(chapterID) {
        const query = `SELECT * FROM ${table} WHERE _id=$1`;
        const values = [
            chapterID
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
