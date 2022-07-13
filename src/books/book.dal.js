const db = require('../../config/database')();
const table = 'books';

const columnAliases = {
    title: 'title',
    cover: 'cover',
    published: 'published',
    forSale: 'for_sale',
    tokenContract: 'token_contract',
    tokenID: 'token_id',
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
        const { _id, cover, title, author,
            published, for_sale:forSale,
            token_contract: tokenContract, token_id: tokenID,
            metadata_uri:metadataURI, metadata_hash:metadataHash } = datum;

        return {
            id: _id,
            ...(forSale != null) && {forSale},
            ...cover && {cover},
            ...metadataURI && {metadataURI},
            ...metadataHash && {metadataHash},
            ...title && {title},
            ...tokenContract && {tokenContract},
            ...tokenID && {tokenID},
            ...(published != null) && {published},
            ...author && {author},
        }
    });
}

module.exports = {
    create(data) {
        const query = `INSERT INTO ${table} (title, author, cover) VALUES($1, $2, $3) RETURNING *`;
        const values = [data.title, data.author, data.cover];

        return db.query(query, values)
            .then(res => {
                return normaliseResult(res.rows)[0];
            });
    },

    update(id, data) {
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
