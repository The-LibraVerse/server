const dal = require('./user.dal');
const sessionManager = require('../sessionManager');
const { ClientError, UnauthorizedError } = require('../errors');
const bookDal = require('../books/book.dal');
const libraryDal = require('../books/library.dal');

function getUserID(param) {
    let userID;

    if(typeof param == 'number' ||
        (typeof param == 'string' && !isNaN(param)))
        userID = param;

    else {
        const session = sessionManager.get(param)
        if(!session)
            throw new UnauthorizedError('You are not logged in.');

        userID = session.userID;
    }

    if(!userID)
        throw new ClientError("Invalid search: " + param + ". Please specify a user ");

    return userID
}

function fetch(param) {
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

    return dal.fetchByID(userID)
        .then(res => {
            const { id, name, username, address} = res;
            return {
                id, name, username, address
            }
        });
}

module.exports = {
    checkAuth(reqObj) {
        const session = sessionManager.get(reqObj);

        const response = {logged_in: false};

        if(session && session.userID)
            response.logged_in = true;

        return Promise.resolve(response);
    },

    signup(data, reqObj) {
        if(!data.address && !(data.username && data.password))
            return Promise.reject( new ClientError('Invalid signup data. Send either username and password, or sign message with your ethereum wallet'));

        const session = sessionManager.get(reqObj);

        if(session && session.userID) {
            return dal.fetchByID(session.userID)
                .then(res => {
                    if(res && res.id)
                        return dal.update(res.id, {address: data.address})
                });
        } else {
            return dal.create(data)
                .then(res => {
                    sessionManager.create(reqObj, res)
                    return res;
                });
        }
    },

    login(data, reqObj) {
        return dal.fetchByUsername(data.username)
            .then(res => {
                if(res) {
                    if(res.password == data.password) {
                        sessionManager.create(reqObj, res);
                        return res;
                    }
                    else throw new ClientError('Invalid username or password');
                } else throw new ClientError('Account with that username does not exist');
            });
    },

    logout(reqObj) {
        return sessionManager.destroy(reqObj);
    },

    dashboard(param, reqObj) {
        let session, userID, dash
        let authorIDs = [];
        const actions = {};

        if(param && reqObj) {
            const _session = sessionManager.get(reqObj);
            if(_session && !isNaN(_session.userID))
                session = _session;

        }

        if(typeof param == 'number' || (!isNaN(param))) {
            userID = param;

        } else {
            const _session = sessionManager.get(param)
            if(!_session)
                throw new UnauthorizedError('You are not logged in.');

            userID = _session.userID;
            session = _session;
        }

        if(!userID)
            throw new ClientError("Invalid search: " + param + ". Please specify a user ");

        return fetch(userID)
            .then(res => {
                dash = {
                    id: res.id,
                    username: res.username,
                    name: res.name,
                }

                if(session && session.userID === res.id) {
                    actions.canCreateBook = true;
                }

                return libraryDal.fetch(userID)
            }).then(res => {
                dash.library = res.map(e => {
                    const { bookTitle: title, bookID:id, bookCover: cover, bookAuthor: author,
                        forSale,
                    } = e;

                    authorIDs.push(author);

                    return {
                        title,
                        id,
                        cover,
                        forSale,
                        author
                    }
                })
                return bookDal.fetchByCreator(userID)
            })
            .then(res => {
                dash.creations = res;

                const _As = new Set(res.map(b => b.author));
                authorIDs.push(..._As);
                authorIDs = [ ...new Set(authorIDs) ];

                return dal.fetchByIDs(authorIDs)
            })
            .then(res => {
                const authors = {};
                res.forEach(u => authors[u.id] = u);

                dash.library = dash.library.map(e => {
                    const author = authors[e.author];
                    delete author.password;
                    delete author.email;

                    return {
                        ...e,
                        author
                    }
                });

                dash.creations = dash.creations.map(e => {
                    const author = authors[e.author];
                    delete author.password;
                    delete author.email;

                    return {
                        ...e,
                        author
                    }
                });

                dash._actions = actions;
                return dash;
            });
    },

    fetch,
}
