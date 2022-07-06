class ClientError extends Error {
    constructor(args) {
        super(args);
        this.name = 'UserError';
    }
}

class UnauthorizedError extends Error {
    constructor(args) {
        super(args);
        this.name = 'Unauthorized';
    }
}

module.exports = { ClientError, UnauthorizedError }
