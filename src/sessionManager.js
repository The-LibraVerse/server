module.exports = {
    create(req, userDeets) {
        req.session.user_id = userDeets.id
    },
    get(req) {
        if(req && req.session && req.session.user_id)
            return { userID: req.session.user_id }
        else return false;
    }
}
