const _routes = {
    auth: '/auth',
    signup: '/signup',
    login: '/login',
    logout: '/logout',
    dashboard: '/user/:user_id/dashboard',
    dashboard_self: '/dashboard',
    fetchBooks: '/books',
    fetchBook: '/book/:book_id',
    createBook: '/books', 
    publishBook: '/book/:book_id/publish',
    createChapter: '/book/:book_id/chapters',
    fetchChapter: '/book/:book_id/chapter/:chapter_id',
    publishChapter: '/book/:book_id/chapter/:chapter_id/publish',
}

const routes = new Proxy(_routes, {
    get: function(target, key, receiver) {
        if(Reflect.has(target, key))
            return Reflect.get(target, key, receiver);
        else
            throw new Error(`Route ${key} is undefined`);
    }
});

module.exports = routes;
