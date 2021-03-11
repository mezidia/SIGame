'use strict';
const Server = require('./server/server').Server;
const Database = require('./database/database').Database;

const database = new Database({
  host: 'db4free.net',
  user: 'sigameadmin',
  password: '#Ananas208',
  database: 'sigame',
});
const server = new Server(5000, database);
