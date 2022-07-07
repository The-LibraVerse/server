const bookDal = require('./book.dal');
const chapterDAL = require('./chapter.dal');
const sessionManager = require('../sessionManager');
const { ClientError, UnauthorizedError } = require('../errors');

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
}

module.exports = {
    create(data, reqObj) {
        // console.log('req ojf:', reqObj);
        let author;

        const session = sessionManager.get(reqObj);
        if(session && session.userID)
            author = session.userID
        else return Promise.reject( new UnauthorizedError('You need to be logged in to create a book'));

        console.log('creating:', author);

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
    },

    fetchAll() {
        return bookDal.fetchAll()
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
