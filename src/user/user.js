const dal = require('./user.dal');
const sessionManager = require('../sessionManager');
const { ClientError, UnauthorizedError } = require('../errors');

module.exports = {
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
    }
}
