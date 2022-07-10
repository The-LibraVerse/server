const users = require('./users');
const books = require('./books');
// const { chapters } = require('./chapters');
const { uploadChaptersToIPFS } = require('./chapters');
const db = require('../../config/database')();

let chapters;

function main() {
    let promiseChain = db.query(`DELETE FROM chapters`)
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

    books.forEach(book => {
        const query = `INSERT INTO books(_id, title, cover, author) VALUES ($1, $2, $3, $4)`;
        const values = [
            book.id, book.title, book.cover, book.author
        ];

        promiseChain = promiseChain.then(() => db.query(query, values))
            .then(db.query(`SELECT setval('"books__id_seq"', 50);`))
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
                const query = `INSERT INTO chapters(_id, book_id, content_ipfs_url, title, cover) VALUES ($1, $2, $3, $4, $5)`;
                const values = [
                    chapter.id, chapter.bookID, chapter.contentURL, chapter.title, chapter.cover
                ];

                chapterPromise = chapterPromise.then(() => db.query(query, values))
                    .then(db.query(`SELECT setval('"chapters__id_seq"', 50);`))
            })

            return chapterPromise;
        })

    return promiseChain;
}

module.exports = main;
