console.log('Environment:', process.env.NODE_ENV);

let config = {};

switch(process.env.NODE_ENV) {
    case 'test':
        config = require('./env/test');
        break;
    case 'development':
        config = require('./env/development');
        break;
    case 'staging':
        config = require('./env/staging');
        break;
    case 'production':
        config = require('./env/production');
        break;
}

if(!config.port)
    config.port = process.env.PORT || 3076;

config = {
    ...config, 
    cookieSettings: {
        ...config.cookieSettings, 
        maxAge: 1000 * 60*60 * 24 * 7,
    },
}

try {
    config.sessionSecret = JSON.parse(process.env.SESSION_SECRETS);
} catch {
    config.sessionSecret = process.env.SESSION_SECRETS;
}

// Set DB connection

if(!config.database)
    config.database = {};

if(process.env.DATABASE_URL)
    config.database.connectionString = process.env.DATABASE_URL;
else {
    if(!process.env.DB_USER || !process.env.DB_PASSWORD)
        throw new Error('DB_USER or DB_password not set!');

    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const host = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbname = config.database.dbName || process.env.DB_NAME || 'the_well_server';

    let connString = `postgresql://${user}:${password}@${host}:${dbPort}/${dbname}`;

    config.database.connectionString = connString;
}

module.exports = config;
