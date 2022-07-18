const externalFetch = require('../externalFetch');
const ipfsAPI = require('../api/ipfs');

const bookDal = require('./book.dal');
const libraryDal = require('../books/library.dal');
const { userDal } = require('../user');
const chapterDAL = require('./chapter.dal');
const sessionManager = require('../sessionManager');
const { ClientError, UnauthorizedError } = require('../errors');

const erc1155 = require('../api/erc1155');

function formatChapter(c) {
    const { title, id, contentURL, content, cover,
        published, forSale, tokenContract, tokenID,
        metadataURI, metadataHash,  } = c;

    return {
        ...(id !== undefined) && {id},
        ...(title !== undefined) && {title},
        ...cover && {cover},
        ...contentURL && {contentURL},
        ...content && {content},
        ...(published != null) && {published},
        ...(forSale != null) && {forSale},
        tokenContract,
        tokenID,
        ...(metadataURI !== undefined) && {metadataURI},
        ...(metadataHash !== undefined) && {metadataHash},
    }

}

function formatBook(b) {
    const { id, title, cover, description,
        published, forSale, tokenContract, tokenID,
        metadataURI,metadataHash, views } = b;

    let author = (typeof b.author == 'number') ?  {id: b.author} :
        (typeof b.author == 'string') ?  {id: b.author} :
        (typeof b.author == 'object') ? b.author : null;

    return {
        id, title, cover, description,
        author,
        views,
        ...(published != null) && {published},
        ...(forSale != null) && {forSale},
        tokenContract,
        tokenID,
        ...(metadataURI !== undefined) && {metadataURI},
        ...(metadataHash !== undefined) && {metadataHash},
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

function getUserID(param, rejectUnauthorized=false) {
    let userID;

    if(typeof param == 'number' ||
        (typeof param == 'string' && !isNaN(param)))
        userID = param;

    else {
        const session = sessionManager.get(param)
        if(!session && rejectUnauthorized)
            return Promise.reject(new UnauthorizedError('You are not logged in.'));

        userID = session.userID;
    }

    if(!userID)
        return Promise.reject("Invalid search: " + param + ". Please specify a user ");
    else return userID

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

module.exports = Object.freeze({
    create(data, reqObj) {
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

    publish(bookID, reqObj) {
        return bookDal.fetchByID(bookID)
            .then(res => {
                const metadata = {
                    name: res.title,
                    image: res.cover,
                };

                return ipfsAPI.uploadSingle(JSON.stringify(metadata))
            }).then(res => {
                return bookDal.update(bookID, {metadataHash: res.cidv1, published: true})
            });
    },

    publishChapter(chapterID, reqObj) {
        return chapterDAL.fetchByID(chapterID)
            .then(res => {
                const metadata = {
                    name: res.title,
                    image: res.cover,
                };

                return ipfsAPI.uploadSingle(JSON.stringify(metadata))
            }).then(res => {
                return chapterDAL.update(chapterID, {metadataHash: res.cidv1, published: true})
            });
    },

    listForSale(bookID, tokenDeets, reqObj) {
        const session = sessionManager.get(reqObj);

        if(!session)
            return Promise.reject(
                new UnauthorizedError('You need to be logged in to complete this action'));

        const data = {forSale: true}
        data.tokenContract = tokenDeets.tokenContract || data.contract;
        data.tokenID = tokenDeets.tokenID;

        return bookDal.fetchByID(bookID)
            .then(res => {
                if(session.userID && session.userID !== res.author)
                    throw new UnauthorizedError('Only this book\'s author can do this.');

                else
                    return bookDal.update(bookID, data)
            });
    },

    listChapterForSale(chapterID, tokenDeets, reqObj) {
        const session = sessionManager.get(reqObj);

        if(!session && session.userID)
            return Promise.reject(new UnauthorizedError('You need to be logged in to complete this action'));
        else session.userID = parseInt(session.userID);

        const data = {forSale: true}
        data.tokenContract = tokenDeets.tokenContract || data.contract;
        data.tokenID = tokenDeets.tokenID;

        return chapterDAL.fetchByID(chapterID)
            .then(res => {
                return bookDal.fetchByID(res.bookID)
            }).then(res => {
                if(res.author != session.userID)
                    throw new UnauthorizedError('You are not authorized to carry out this action');
                else
                    return chapterDAL.update(chapterID, data)
            });
    },

    /**
     * data.content should be an ipfs url or hash
     */
    addChapter(bookID, data, sessionObj) {
        const metadata = (data.metadata && typeof data.metadata == 'object') ?
            data.metadata : {};

        if(data.cover)
            metadata.cover = data.cover;
        if(data.title)
            metadata.title = data.title;

        const content = data.content;

        if(!content)
            return Promise.reject( new ClientError('Chapter content not included'));

        const session = sessionManager.get(sessionObj);

        if(!session)
            return Promise.reject(new UnauthorizedError('You are not logged in.'));

        return (() => {
            if(!metadata.title) {
                return chapterDAL.fetchCountForBook(bookID)
                    .then(count => {
                        metadata.title = 'Chapter ' + (count + 1);
                    });
            }

            return Promise.resolve();
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

        let chapter = {}, book = {author: {}}, actions={};
        return chapterDAL.fetchByID(chapterID)
        // return chapterDAL.fetchByID(bookID, chapterID)
            .then(res => {
                chapter = formatChapter(res);
                return bookDal.fetchByID(res.bookID)
            }).then(res => {
                book = formatBook(res);
                return externalFetch.fetch(chapter.contentURL)
            })
            .then(res => {
                chapter.content = res;
                chapter.book = {
                    id: bookID,
                    title: book.title,
                    author: {
                        id: book.author.id
                    }
                }

                if(book.author && session && book.author.id === session.userID) {
                    actions.canSell = true;
                    actions.canEdit=true;

                    if(chapter.metadataHash) {
                        chapter.metadataURI = ipfsAPI.hashToURL(chapter.metadataHash);
                        chapter.metadataURL = ipfsAPI.hashToURL(chapter.metadataHash);
                    }

                    console.log(chapter.metadataURI);
                    if(!chapter.published || !chapter.metadataURI)
                        actions.canSell = false;
                    if(!book.published)
                        actions.canSell = false;
                }
                else {
                    if(chapter.forSale) {
                        chapter._notice = {
                            message: 'You need to have token id ' + chapter.tokenID + 'to view this chapter.  Connect your wallet to see if you have the tokens required to view this chapter',
                            code: 'TOKEN_REQUIRED'
                        }
                    }
                    delete chapter.contentURL;
                    delete chapter.metadataURI;
                    delete chapter.metadataHash;
                }

                chapter._actions = actions;

                return chapter;
            });
    },

    deleteChapter(bookID, chapterID) {
        return chapterDAL.deleteChapter(bookID, chapterID)
    },

    fetchBook(bookID, reqObj) {
        const session = sessionManager.get(reqObj);

        // Actions that can be taken on the book
        const actions={canView:true, canViewChapters:true, canCreateChapter:false};
        const otherResponse = {};

        let totalChapters=0, chapters = [], book;

        return bookDal.fetchByID(bookID)
            .then(res => {
                book = {...res};
                book.views++;
                // Update book view counter
                return bookDal.update(bookID, {views: book.views})
            }).then(() => {
                if(book.forSale) {
                    // console.log('bok is for sale:', book.forSale);

                    actions.canView = false;
                    actions.canViewChapters = false;
                    if(book.tokenContract && book.tokenID) {
                        otherResponse._notice = {
                            message: 'You do not have the token required to view this book',
                            code: 'TOKEN_REQUIRED'
                        }
                        if(session.address) {
                            return erc1155.balance(session.address, book.tokenContract, book.tokenID)
                                .then(res => {
                                    if(res > 0) {
                                        // console.log('has enought tokens');
                                        actions.canView = true;
                                        actions.canViewChapters = true;
                                    } else {
                                        // console.log('has zero tokens');
                                        otherResponse._message = 'You do not have the token required to view this book';
                                        otherResponse._code = 'TOKEN_REQUIRED';
                                    }
                                });
                        } else return Promise.resolve()
                        // TODO: else if !session.address, add message and code, or notice

                    } else return Promise.resolve()
                } else return Promise.resolve()

            }).then(() => {
                return chapterDAL.fetchCount(bookID)
            })
            .then(res => {
                if(!res)
                    totalChapters = 0;
                else totalChapters = res;

                return chapterDAL.fetchAll(bookID)
            }).then(res => {
                chapters = [ ...res ];
                return fetchAuthors([book])
            })
            .then(res => {
                book = res[0];
                // console.log('book:', book);

                if(session.userID == book.author.id) {
                    // console.log('is author');
                    delete otherResponse._notice;

                    actions.canSell = false, actions.canPublish=false;

                    actions.canView = true; actions.canViewChapters = true;
                    actions.canEdit=true;
                    actions.canCreateChapter=true;

                    if(book.published) {
                        actions.canSell = true;
                        if(book.forSale)
                            actions.canSell = false;
                    } else {
                        actions.canPublish = true;
                    }

                    if(book.metadataHash)
                        book.metadataURI = ipfsAPI.hashToURL(book.metadataHash);
                    else {
                        book.metadataHash = null;
                        book.metadataURI = null;
                    }

                    delete otherResponse._code;
                    delete otherResponse._message;

                } else {
                    chapters = chapters.filter(c => c.published === true)
                        .map(_c => {
                            let c = Object.assign({}, _c);

                            delete c.metadataURI;
                            delete c.metadataHash;
                            delete c.contentURL;
                            delete c.published;
                            return c;
                        });

                    if(!actions.canViewChapters)
                        chapters = chapters.map(c => ({ id:c.id, title:c.title, published:c.published }));

                    delete book.published;
                    delete book.metadataHash;
                    delete book.metadataURI;
                    // delete c.contentURL;
                }

                // console.log('other response:', otherResponse);

                chapters = chapters.map(c => formatChapter(c))

                return {...book,
                    ...otherResponse,
                    _actions: actions,
                    chapters,
                    totalChapters
                };
            });
    },

    fetchAll() {
        return bookDal.fetchAll()
            .then(res => {
                return fetchAuthors(
                    res.filter(b => b.published)
                    .map(_b => {
                        const b = Object.assign({}, _b);
                        // console.log('b:', b);

                        delete b.published;
                        delete b.metadataURI;
                        return b;
                    })
                )
            })
            .then(res => {
                const topPaid = res.filter(b => b.forSale == true && b.tokenID);
                const topFree = res.filter(b => b.forSale == false && !b.tokenID);

                return {
                    popular: res,
                    topPaid,
                    topFree,
                    featured: res,
                    continueReading: res,
                }
            });
    },

    addToLibrary(bookID, sessionObj) {
        const userID = getUserID(sessionObj, true);

        return libraryDal.addToLibrary(userID, bookID)
        .then(res => {
            return res;
        });
    },

    userBooks(param) {
        const myBooks = {}

        return createdBy(param)
            .then(res => {
                myBooks.creations = res;

                const userID = getUserID(param);
                return libraryDal.fetch(userID)
            })
            .then(res => {
                myBooks.library = res.map(e => {
                    const { bookTitle: title, bookID:id, bookCover: cover, bookAuthor: author,
                        forSale,
                    } = e;

                    return {
                        title,
                        id,
                        cover,
                        forSale,
                        author
                    }
                })
                return fetchAuthors(myBooks.library);
            }).then(res => {

                myBooks.library = res;
                return myBooks;
            });
    },

    createdBy
})
