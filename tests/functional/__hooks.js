const { seedDatabase } = require('../testData');

exports.mochaHooks = {
    beforeEach() {
        return seedDatabase;
    }
}

