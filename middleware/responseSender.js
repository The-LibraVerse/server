const routes = require('../src/routes');

module.exports = function(req, res, next) {
    const oldSend = res.send;

    res.send = function(response) {
        const links = {};
        res.send = oldSend;

        const unparsedRoute = req.route.path;

        if(response) {
            if(Array.isArray(response))
                response = { data: response }

            if(response.clearSiteData) {
                let headerVal = response.clearSiteData;

                if(response.clearSiteData === true)
                    headerVal = '';

                res.set('Clear-Site-Data', headerVal);

                delete response.clearSiteData;
            } else if(response.clearCookies) {
                res.set('Clear-Site-Data', '"cookies"');
                delete response.clearCookies;
            }

            if(response._actions) {
                const actions = response._actions;
                // console.log('actions:', response._actions);
                // console.log('request', req, req.path);
                // console.log('request', req.path, req.params);

                // user dashboard
                if(unparsedRoute == routes.dashboard || unparsedRoute == routes.dashboard_self) {
                    if(actions.canCreateBook === true) {

                        links.create_book = {
                            method: 'POST',
                            href: '/books'
                        }
                    }
                }
                // fetch book
                else if(unparsedRoute == routes.fetchBook) {
                    const book_id = req.params.book_id;
                    if(actions.canSell === true) {
                        links.sell = {
                            href: '/book/' + book_id + '/sell',
                            method: 'POST'
                        }
                    }
                    if(actions.canPublish === true) {
                        links.publish = {
                            href: '/book/' + book_id + '/publish',
                            method: 'PUT'
                        }
                    }
                    if(actions.canCreateChapter === true) {
                        links.create_chapter = {
                            href: '/book/' + book_id + '/chapters',
                            method: 'POST'
                        }
                    }
                }
                else if(unparsedRoute === routes.fetchChapter) {
                    const bk = req.params.book_id, ch = req.params.chapter_id;
                    if(actions.canSell === true) {
                        links.sell = {
                            href: '/book/' + bk + '/chapter/' + ch + '/sell',
                            method: 'POST'
                        }
                    }
                    if(actions.canPublish === true) {
                        links.publish = {
                            href: '/book/' + bk + '/chapter/' + ch + '/publish',
                            method: 'PUT'
                        }
                    }
                }
            }
        }

        return res.send({...response, _links: links});
    }
    next();
}

