const proxyquire = require('proxyquire');
const masterStubs = require('./stubs');

const paths = {
    userDal: './user.dal',
    session: '../sessionManager',
    sessionManager: '../sessionManager',
    libraryDal: '../books/library.dal',
}

const userPath = '../../src/user/user';

function createStubs(stubsInit) {
    const allStubs = masterStubs(stubsInit);

    return {
        [paths.sessionManager]: allStubs.sessionManager,
        [paths.userDal]: allStubs.userDal,
        [paths.libraryDal]: allStubs.libraryDal,
    }
}

function stubUserModule(stubs) {
    if(!stubs)
        stubs = createStubs();
    else if(stubs && !stubs[paths.sessionManager] && !stubs[paths.userDal]
        && !stubs[paths.libraryDal]
    )
        stubs = createStubs(stubs)

    return proxyquire(userPath, stubs);
}

module.exports = {
    paths, stubUserModule, createStubs
}
