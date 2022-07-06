process.env.DEBUG = false;
const dbName = process.env.DB_NAME;
// process.env.DEBUG=express-session

module.exports = {
    database: {
        dbName,
        connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@localhost:5432/${dbName}`
    },
    cors: { },
}

