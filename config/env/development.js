module.exports = {
    cors: {
        origin: (process.env.CORS_ORIGINS) ? JSON.parse(process.env.CORS_ORIGINS) : 'http://localhost:8080',
        // origin: '*',
        credentials: true
    },
    cookieSettings: {
        sameSite: 'strict',
        httpOnly: true
    }
}

