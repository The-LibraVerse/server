
async function loadIpfs() {
    const { create } = await import('ipfs-http-client');
    return create();
}

function single(content, name) {
    let path = name;
    if(!name)
        path = 'file' + (Math.random() * 1000);
    const body = {
    }
    return loadIpfs()
        .then(client => {
            return client.add({ content, path})
        })
        .then(res => {
            const cidv1 = res.cid.toV1().toString();

            let gatewayUrl = 'localhost:8080';

            let fileUrl = 'http://' + cidv1 + '.ipfs.' + gatewayUrl

            return {cidv1, url: fileUrl };
        });
}

function batch(content, path) {
    if(!path)
        path = 'dir' + (Math.random() * 1000);
    const body = {
    }
    return loadIpfs()
        .then(client => {
            return client.addAll(content)
        })
        .then(async generator => {
            const files = [];
            for await (const res of generator) {
                const cidv1 = res.cid.toV1().toString();

                let gatewayUrl = 'localhost:8080';

                let fileUrl = 'http://' + cidv1 + '.ipfs.' + gatewayUrl

                files.push({cidv1, url: fileUrl});
            }

            return files;
        });
}
module.exports = {
    single,
    batch
}
