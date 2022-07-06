module.exports = {
    database: {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    },
    cookieSetings: {
        sameSite: 'none',
        secure: true,
        httpOnly: true
    },
    cors: {
        origin: (process.env.CORS_ORIGINS) ? JSON.parse(process.env.CORS_ORIGINS) :
            ['https://staging.the-well.is', 'http://localhost', 'http://localhost:3000'],
        credentials: true
    },
    baseURL: '',
}

