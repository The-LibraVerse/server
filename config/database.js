const {Pool} = require("pg");
const mainConfig = require('./index');
let pool;

// self initializing db;
function db() {
    if(pool)
        return pool;
    else {
        const config = mainConfig.database;

        const dbConfig = {
            connectionString: config.connectionString,
            ...config.max && {max: config.max},
            ...config.idleTimeoutMillis && {idleTimeoutMillis: config.idleTimeoutMillis},
            ...config.connectionTimeoutMillis && {connectionTimeoutMillis: config.connectionTimeoutMillis},
            ...(config.ssl) && { ssl: config.ssl }
        }

        pool = new Pool(dbConfig);

        return pool;
    }
}

module.exports = db;
