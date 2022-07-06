const chai = require('chai');
const chaiPromised = require('chai-as-promised');
chai.use(chaiPromised);

exports.mochaHooks = {
    beforeAll() {
        chai.use(chaiPromised);
    }
}

