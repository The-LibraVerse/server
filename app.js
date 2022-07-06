console.log('Libraverse server is starting...');

let app = require('express')();
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./config');
const routes = require('./src/routes');

app.use(helmet());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors(config.cors));

// Session and Cookies
const session = require('express-session');
const pgSessionStore = require('connect-pg-simple')(session);

let cookie = config.cookieSettings;

// Database
const pool = require('./config/database')();

const pgSession = new pgSessionStore({
    pool,
    tableName: 'sessions',
    createTableIfMissing: true
});
const sessionConfig = {
    store:  pgSession,
    name: 'libraverse.cookie',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie
}

app.use(session(sessionConfig));

// Routes
app.use(routes);

module.exports = app;

