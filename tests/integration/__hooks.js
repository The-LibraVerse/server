const { seedDatabase } = require('../testData');

exports.mochaHooks = {
    beforeAll() {
        this.timeout(20000);
        return seedDatabase();
    }
}


