const { seedDatabase } = require('../testData');

exports.mochaHooks = {
    beforeEach() {
        this.timeout(20000);
        return seedDatabase();
    }
}


