const bookDal = require('./book.dal');
const { userDal } = require('../user');
const chapterDAL = require('./chapter.dal');
const sessionManager = require('../sessionManager');
const { ClientError, UnauthorizedError } = require('../errors');

function fetchAuthors(books) {
    let authorIDs = books.map(i => i.author);

    authorIDs = [...new Set(authorIDs)];

    return userDal.fetchByIDs(authorIDs)
    .then(res => {
        const authors = {};

        res.forEach(u => {
            authors[u.id] = u;
        });

        return books.map(b => {
            const { id, title } = b;

            const authorDeets = authors[b.author];

            const author = {}

            if(authorDeets) {
                if(authorDeets.id)
                    author.id = authorDeets.id;
                if(authorDeets.name)
                    author.name = authorDeets.name;
                if(authorDeets.username)
                    author.username = authorDeets.username;
            }

            return {
                id, title,
                author,
            }
        });
    });
}

function createdBy(param) {
    let userID;

    if(typeof param == 'number' ||
        (typeof param == 'string' && !isNaN(param)))
        userID = param;

    else {
        const session = sessionManager.get(param)
        if(!session)
            return Promise.reject(new UnauthorizedError('You are not logged in.'));

        userID = session.userID;
    }

    if(!userID)
        return Promise.reject("Invalid search: " + param + ". Please specify a user ");

    return bookDal.fetchByCreator(userID)
        .then(res => {
            return fetchAuthors(res)
        })
}

module.exports = {
    create(data, reqObj) {
        // console.log('req ojf:', reqObj);
        let author;

        const session = sessionManager.get(reqObj);
        if(session && session.userID)
            author = session.userID
        else return Promise.reject( new UnauthorizedError('You need to be logged in to create a book'));

        return bookDal.create({...data, author})
            .then(res => {
                return { id: res.id};
            }).catch(e => {
                throw e
            })
    },
    addChapter(data) {
        const metadata = data.metadata;
        const content = data.content;

        if(!content)
            return Promise.reject( new ClientError('Chapter content not included'));

        return chapterDAL.create(metadata, content)
    },
    deleteChapter(bookID, chapterID) {
        return chapterDAL.deleteChapter(bookID, chapterID)
    },

    fetchBook(bookID) {
        return bookDal.fetchByID(bookID)
        .then(res => {
            return fetchAuthors([res])
        })
    },

    fetchAll() {
        return bookDal.fetchAll()
        .then(res => {
            return fetchAuthors(res)
        })
    },

    userBooks(param) {
        const library = {}
        return createdBy(param)
            .then(res => {
                library.creations = res;

                return library;
            });
    },

    createdBy
}
