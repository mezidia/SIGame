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
*/
const server = new Server(5000);

