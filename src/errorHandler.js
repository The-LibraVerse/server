const { ClientError, UnauthorizedError } = require('./errors');

module.exports = function(e, req, res, next) {
    let error = {};
    error.message= 'Unknown error. Please try again later';

    res.status(500);

    if(e instanceof ClientError || e instanceof UnauthorizedError) {
        error = e.message;
        if(e instanceof ClientError)
            res.status(400);
        else if(e instanceof UnauthorizedError)
            res.status(401);
    } else
        console.log(e);

    return res.send({
        error
    });
}

