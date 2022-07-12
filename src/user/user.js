const dal = require('./user.dal');
const sessionManager = require('../sessionManager');
const { ClientError, UnauthorizedError } = require('../errors');

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
        return sessionManager.destroy(reqObj)
    },

    fetch(param) {
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
}
