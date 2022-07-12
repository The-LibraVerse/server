module.exports = function(req, res, next) {
    const oldSend = res.send;

    res.send = function(data) {
        res.send = oldSend;

        if(data.clearSiteData) {
            let headerVal = data.clearSiteData;

            if(data.clearSiteData === true)
                headerVal = '';

            res.set('Clear-Site-Data', headerVal);
            delete data.clearSiteData;
        } else if(data.clearCookies) {
            res.set('Clear-Site-Data', '"cookies"');
            delete data.clearCookies;
        }

        return res.send(data);
    }
    next();
}

