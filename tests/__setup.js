const chai = require('chai');
const chaiPromised = require('chai-as-promised');
chai.use(chaiPromised);

chai.use(
    require('chai-string')
);

exports.mochaHooks = {
    beforeAll() {
        chai.use(chaiPromised);
    }
}

