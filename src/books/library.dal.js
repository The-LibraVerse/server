const db = require('../../config/database')();
const table = 'library';

function normalise(results) {
    if(!Array.isArray(results))
        results = [results];

    return results.map(lib => {
        const { user_id, book_id, id, title, cover, author,
            for_sale:forSale, date_added: dateAdded } = lib;

        return {
            userID: user_id,
            bookID: book_id,
            bookTitle: title,
            bookCover: cover,
            bookAuthor: author,
            dateAdded,
            ...(forSale != null) && {forSale},
        }
    });
}

function addToLibrary(userID, bookID) {
    const query = `INSERT INTO ${table} (user_id, book_id) VALUES($1, $2)`;
    const values = [ userID, bookID];

    return db.query(query, values)
    .then(res => normalise(res.rows)[0]);
}

// returns books
function fetch(userID) {
    const query = `SELECT * from ${table}
        LEFT JOIN books book on book._id = book_id
        WHERE user_id=$1`;
    const values = [userID];

    return db.query(query, values)
    .then(res => normalise(res.rows));
}

module.exports = {
    addToLibrary,
    fetch,
}
