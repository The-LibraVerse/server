const users = require('./users');
const books = require('./books');
const libraries = require('./libraries');
// const { chapters } = require('./chapters');
const { uploadChaptersToIPFS } = require('./chapters');
const db = require('../../config/database')();

let chapters;

function main() {
    let promiseChain = db.query(`DELETE FROM chapters`)
        .then(() => db.query(`DELETE FROM library`))
        .then(() => db.query(`DELETE FROM books`))
        .then(() => db.query(`DELETE FROM users`))

    users.forEach(user => {
        const query = `INSERT INTO users(_id, name, username, password, address) VALUES($1, $2, $3, $4, $5)`;
        const values = [
            user.id, user.name, user.username, user.password, user.address
        ];

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"users__id_seq"', 55);`))
    });

    // console.log('seeding db with books:', books);

    books.forEach(book => {
        const query = `INSERT INTO books(_id, title, cover, author,
            for_sale, published,
            metadata_uri, metadata_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;

        const values = [
            book.id, book.title, book.cover, book.author,
            book.forSale, book.published,
            book.metadataURI, book.metadataHash,
        ];

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"books__id_seq"', 50);`))
            // .catch(e => console.log('e:', e));
    });

    libraries.forEach(library => {
        const query = `INSERT INTO library(user_id, book_id, date_added) VALUES ($1, $2, $3)`;
        const values = [
            library.userID, library.bookID, library.date_added,
        ];

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"library__id_seq"', 100);`))
            .catch(e => e);
            // .catch(e => console.log(e));
    });

    promiseChain = promiseChain
        .then(() => {
            if(chapters)
                return Promise.resolve(false)
            else return uploadChaptersToIPFS()
        })
        .then(res => {
            if(res)
                chapters = res;

            let chapterPromise = Promise.resolve();
            chapters.forEach(chapter => {
                const query = `INSERT INTO chapters(_id, book_id, content_ipfs_url, title, cover, for_sale, published, metadata_uri) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
                const values = [
                    chapter.id, chapter.bookID, chapter.contentURL, chapter.title, chapter.cover,
                    chapter.forSale, chapter.published, chapter.metadataURI,

                ];

                chapterPromise = chapterPromise.then(() => db.query(query, values))
                    .then(db.query(`SELECT setval('"chapters__id_seq"', 50);`))
                    .catch(e => e);
                // .catch(e => console.log('e:', e));
            })

            return chapterPromise;
        })

    return promiseChain;
}

module.exports = main;
