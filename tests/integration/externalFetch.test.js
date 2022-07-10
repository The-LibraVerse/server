// Tests for fetcher from external apis

const ipfsUpload = require('../helpers/ipfsUpload');
const fetcher = require('../../src/externalFetch');
const { expect } = require('chai');
const { faker } = require('@faker-js/faker');

describe('Tests for external fetch', function() {
    it('Fetch url', function() {
        const content = faker.lorem.paragraphs(15);
        const url = faker.internet.url();

        return ipfsUpload.single(content)
        .then(res => {
            return fetcher.fetch(res.url)
        })
        .then(res => expect(res).to.equal(content));
    });
});
