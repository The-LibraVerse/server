const bookDal = require('./book.dal');
const chapterDAL = require('./chapter.dal');
const { ClientError, UnauthorizedError } = require('../errors');

module.exports = {
    create(data) {
        return bookDal.create(data)
        .then(res => {
            return res.id;
        });
    },
    addChapter(data) {
        const metadata = data.metadata;
        const content = data.content;

        if(!content)
            return Promise.reject( new ClientError('Chapter content not included'));

        return chapterDAL.create(metadata, content)
    },
    deleteChapter(bookID, chapterID) {
        return chapterDAL.delete(bookID, chapterID)
    }
}
