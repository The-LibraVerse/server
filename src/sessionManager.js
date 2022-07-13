module.exports = {
    create(req, userDeets) {
        req.session.user_id = userDeets.id
    },
    get(req) {
        if(req && req.session && req.session.user_id)
            return {
                userID: req.session.user_id,
                address: req.session.address || null
            }
        else return false;
    },

    destroy(req) {
        return new Promise((resolve, reject) => {
            req.session.destroy(function(err) {
                if(err)
                    reject(err)
                else 
                    if(!err)
                        return resolve({ clearCookies: true });
            });
        });
    }
}
