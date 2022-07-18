const { IPFS_GATEWAY, IPFS_API } = require('../constants');

async function loadIpfs() {
    const { create } = await import('ipfs-http-client');
    return create(IPFS_API);
}

function getGateway() {
    const g = IPFS_GATEWAY;
    if(!g)
        throw new Error('IPFS GATEWAY NOT SET');

    return g;
}

function hashToURL(hash) {
    const cidv1 = hash;
    const gateway = getGateway()
    let gatewayUrl = gateway;

    const ifHttp = /^http:\/\//.test(gateway);
    const ifHttps = /^https:\/\//.test(gateway);


    if(/^http/.test(gatewayUrl)) {
        gatewayUrl = gatewayUrl.replace(/^https?:\/\//, '');
        gatewayUrl = gatewayUrl.replace(/\/ipfs/, '');
        gatewayUrl = gatewayUrl.replace(/\/$/, '');
    }

    let fileUrl = /^https?/.test(IPFS_GATEWAY) ? 
        IPFS_GATEWAY.match(/^https?:\/\//)[0] : 'https://';

    fileUrl += cidv1 + '.ipfs.' + gatewayUrl

    return fileUrl;
}

function uploadSingle(content, name) {
    let path = name;
    if(!name)
        path = 'libraverse-file' + (Math.random() * 1000);
    const body = {
    }
    return loadIpfs()
        .then(client => {
            return client.add({ content, path})
        })
        .then(res => {
            const cidv0 = res.cid.toV0().toString();
            const cidv1 = res.cid.toV1().toString();

            return {cidv1, cidv0 };
        });
}

function uploadBatch(content, path) {
    if(!path)
        path = 'libraverse-dir' + (Math.random() * 1000);
    const body = {
    }
    return loadIpfs()
        .then(client => {
            return client.addAll(content)
        })
        .then(async generator => {
            const files = [];
            for await (const res of generator) {
                const cidv0 = res.cid.toV0().toString();
                const cidv1 = res.cid.toV1().toString();

                files.push({cidv1, cidv0 });
            }

            return files;
        });
}
module.exports = {
    getGateway,
    hashToURL,
    uploadSingle,
    uploadBatch,
}
