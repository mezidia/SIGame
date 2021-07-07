'use strict';
const Server = require('./server/server').Server;

const server = new Server(process.env.PORT || 5000);
