const externalFetch = require('../externalFetch');
const bookDal = require('./book.dal');
const { userDal } = require('../user');
const chapterDAL = require('./chapter.dal');
const sessionManager = require('../sessionManager');
const { ClientError, UnauthorizedError } = require('../errors');

function formatChapter(c) {
    const { title, id, contentURL, content, cover } = c;
    return {
        id,
        title,
        cover,
        ...contentURL && {contentURL},
        ...content && {content},
    }
}

function formatBook(b) {
    const { id, title, cover  } = b;

    let author = (typeof b.author == 'number') ?  {id: b.author} :
        (typeof b.author == 'string') ?  {id: b.author} :
        (typeof b.author == 'object') ? b.author : null;

    return {
        id, title, cover,
        author,
    }
}

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
                b = formatBook(b);
                const authorDeets = authors[b.author.id];

                const author = {
                    id: b.author
                }

                if(authorDeets) {
                    if(authorDeets.id)
                        author.id = authorDeets.id;
                    if(authorDeets.name)
                        author.name = authorDeets.name;
                    if(authorDeets.username)
                        author.username = authorDeets.username;
                }

                return {
                    ...b,
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
    /**
     * data.content should be an ipfs url or hash
     */
    addChapter(bookID, data, sessionObj) {
        let metadata = data.metadata;
        const content = data.content;

        if(!content)
            return Promise.reject( new ClientError('Chapter content not included'));

        const session = sessionManager.get(sessionObj);

        if(!session)
            return Promise.reject(new UnauthorizedError('You are not logged in.'));

        return (() => {
            if(!metadata)
                metadata = {}
            if(!metadata.title) {
                return chapterDAL.fetchCountForBook(bookID)
                    .then(count => {
                        metadata.title = 'Chapter ' + (count + 1);
                    });
            } else return Promise.resolve();
        })()
            .then(() => bookDal.fetchAuthorID(bookID))
            .then(res => {
                if(res != session.userID)
                    return Promise.reject(new UnauthorizedError('You do not have permission to do this.'));
                else
                    return chapterDAL.create(bookID, content, metadata) 
            });
    },

    fetchChapter(bookID, chapterID, reqObj) {
        const session = sessionManager.get(reqObj);

        let chapter = {};
        return chapterDAL.fetchByID(bookID, chapterID)
            .then(res => {
                chapter = formatChapter(res);
                return externalFetch.fetch(chapter.contentURL)
            })
            .then(res => {
                chapter.content = res;

                delete chapter.contentURL;
                return chapter;
            });
    },

    deleteChapter(bookID, chapterID) {
        return chapterDAL.deleteChapter(bookID, chapterID)
    },

    fetchBook(bookID, reqObj) {
        const session = sessionManager.get(reqObj);

        let totalChapters=0, chapters = [], book;

        return bookDal.fetchByID(bookID)
        .then(res => {
            book = res;
            return chapterDAL.fetchCount(bookID)
        })
            .then(res => {
                if(!res)
                    totalChapters = 0;
                else totalChapters = res;

                return chapterDAL.fetchAll(bookID)
            }).then(res => {
                chapters = res.map(c => {
                    if(session.userID != book.author)
                        delete c.contentURL;
                    return formatChapter(c)
                });

                return fetchAuthors([book])
            })
            .then(res => {
                res = res[0];

                return {...res,
                    chapters,
                    totalChapters
                };
            });
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
