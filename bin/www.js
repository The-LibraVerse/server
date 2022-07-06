const http = require('http');
const app = require('../app');

const { port } = require('../config');

let server = http.createServer(app);

server.listen(port);
server.timeout = 500000;

module.exports = server;


