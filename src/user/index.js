const user = require('./user');
const userDAL = require('./user.dal');

module.exports = {
    user,
    userDal: userDAL,
    userDAL,
}
