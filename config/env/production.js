module.exports = {
    database: {
        ssl: {
            rejectUnauthorized: false,
        },
    },
    cookieSetings: {
        sameSite: 'strict',
        secure: true,
        httpOnly: true
    },
    cors: {
        origin: 'https://ziltv.adesuwa.dev',
        credentials: true
    },
}

