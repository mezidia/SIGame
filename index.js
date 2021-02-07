'use strict';
const Server = require('./server/server').Server;
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
const server = new Server(5000);

