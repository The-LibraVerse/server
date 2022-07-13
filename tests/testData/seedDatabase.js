const users = require('./users');
const books = require('./books');
const libraries = require('./libraries');
const { chapters } = require('./chapters');
const db = require('../../config/database')();

function main() {
    let promiseChain = db.query(`DELETE FROM chapters`)
        .then(() => db.query(`DELETE FROM library`))
        .then(() => db.query(`DELETE FROM books`))
        .then(() => db.query(`DELETE FROM users`))

    {
        let query = `INSERT INTO users(_id, name, username, password, address) VALUES `;
        // let query = `INSERT INTO users(_id, name, username, password, address) VALUES (`;
        const values = [];

        users.forEach((user, i) => {
            if(i > 0)
                query += ',';
            const init = i * 5;
            query += `(
                $${init + 1}::integer, $${init + 2}, $${init + 3}, $${init + 4}, $${init + 5})`;

            values.push(
                user.id, user.name, user.username, user.password, user.address
            );
        });

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"users__id_seq"', 200);`))
            .catch(e => console.log('e:', e));
    }

    {
        let  query = `INSERT INTO books(_id, title, cover, author,
            for_sale, published,
            metadata_uri, metadata_hash)
        VALUES `;

        const values = [];

        books.forEach((book, i) => {
            if(i > 0)
                query += ',';

            const j = i * 8;

            query += `(
                $${j + 1}, $${j + 2}, $${j + 3}, $${j + 4}, $${j + 5}, $${j + 6}, $${j + 7}, $${j + 8})`;

            values.push(
                book.id, book.title, book.cover, book.author,
                book.forSale, book.published,
                book.metadataURI, book.metadataHash,
            );
        });

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"books__id_seq"', 200);`))
        // .catch(e => console.log('e:', e));
    }

    {
        let query = `INSERT INTO library(user_id, book_id, date_added) VALUES `;
        const values = [];

        libraries.forEach((library, i) => {
            if(i > 0)
                query += ',';

            const j = i * 3;

            query += `
                ($${j + 1}::integer, $${j + 2}::integer, $${j + 3})`;

            values.push(
                library.userID, library.bookID, library.date_added,
            );
        });

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"library__id_seq"', 200);`))
        // .catch(e => e);
            // .catch(e => console.log(e));
            .catch(e => {
                if(e.routine == '_bt_check_unique')
                    console.log('Error adding entries to library db table', e.detail);
                else {
                    console.log('query:', query, values.slice(10));
                    console.log(e)
                }
            });
    }

    {
        let query = `INSERT INTO chapters(_id, book_id, content_ipfs_url, title, cover, for_sale, published, metadata_uri)
        VALUES `;

        const values = [];

        chapters.forEach((chapter,i) => {
            if(i > 0)
                query += ',';

            const j = i * 8;

            query += `(
                $${j + 1}, $${j + 2}, $${j + 3}, $${j + 4}, $${j + 5}, $${j + 6}, $${j + 7}, $${j + 8}
            )`;

            values.push(
                chapter.id, chapter.bookID, chapter.contentURL, chapter.title, chapter.cover,
                chapter.forSale, chapter.published, chapter.metadataURI,

            );
        })

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"chapters__id_seq"', 200);`))
            .catch(e => e);
        // .catch(e => console.log('e:', e));
    }

    return promiseChain;
}

module.exports = main;
