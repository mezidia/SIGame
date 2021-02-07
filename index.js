'use strict';
const Server = require('./server/server').Server;
const Database = require('./database/database').Database;
/*
      const msg = {
        'mType': 'newGame',
        data: {
          bundle,
          settings,
        },
      }
      socket.send(JSON.stringify(msg));
            const settings = {
        roomName,
        password,
        questionBundle,
        gameMode,
        role,
        totalPlayers,
        ppl,
        socket,
      };
  const msg = {
    'mType': 'getAllBundles',
  };
  promisifySocketMSG(msg, 'allBundles', socket).then(data => {
    allBundles = data.allBundles;
    changeHash('createGame')();
  });


*/
const database = new Database({
  host: 'sql7.freemysqlhosting.net',
  user: 'sql7391378',
  password: 'j42JlvEiNG',
  database: 'sql7391378',
});
const server = new Server(5000, database);
