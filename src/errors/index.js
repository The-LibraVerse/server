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

class OtherError extends Error {
    constructor(args) {
        super(args);
        this.name = 'Other'
    }
}

module.exports = { ClientError, OtherError, UnauthorizedError }

