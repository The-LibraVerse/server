const { expect }  =require('chai');
const { ClientError, UnauthorizedError } = require('../../src/errors');
const sinon = require('sinon');
const { faker } = require('@faker-js/faker');

const { createStubs, stubModule, paths } = require('./ipfs.stubs');

describe('IPFS helper module unit tests', function() {
    const hash = 'bafybeicbmdhqlyic5rawduta3meqd7bplbqjgoc4wbwhrjqwn5ylal7cwe';

    it('Write IPFS gateway subdomain string when gateway is http://', function() {
        const gatewayDomain = faker.internet.domainName();
        const url = 'http://' + gatewayDomain;

        const stubs = createStubs();
        stubs[paths.constants] = { IPFS_GATEWAY: url, foobar: true }

        const ipfsModule = stubModule(stubs);

        expect( ipfsModule.hashToURL(hash) ).to.equal(
            'http://' + hash + '.ipfs.' +  gatewayDomain);
    });

    it('Write IPFS gateway subdomain string when gateway is https://', function() {
        const gatewayDomain = faker.internet.domainName();
        const url = 'https://' + gatewayDomain;

        const stubs = createStubs();
        stubs[paths.constants] = { IPFS_GATEWAY: url, foobar: true }

        const ipfsModule = stubModule(stubs);

        expect( ipfsModule.hashToURL(hash) ).to.equal(
            'https://' + hash + '.ipfs.' +  gatewayDomain);
    });

    it('Write IPFS gateway subdomain string when gateway ends in /', function() {
        const gatewayDomain = faker.internet.domainName();
        const url1 = 'http://' + gatewayDomain + '/';
        const url2 = 'https://' + gatewayDomain + '/';

        const stubs = createStubs();

        stubs[paths.constants] = { IPFS_GATEWAY: url1, foobar: true }
        let ipfsModule = stubModule(stubs);
        expect( ipfsModule.hashToURL(hash) ).to.equal(
            'http://' + hash + '.ipfs.' +  gatewayDomain);

        stubs[paths.constants] = { IPFS_GATEWAY: url2, foobar: true }
        ipfsModule = stubModule(stubs);
        expect( ipfsModule.hashToURL(hash) ).to.equal(
            'https://' + hash + '.ipfs.' +  gatewayDomain);

    });

    it('Write IPFS gateway subdomain string when gateway does not end in /');
});
