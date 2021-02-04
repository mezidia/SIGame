'use strict';

//messages from server
//client.send(JSON.stringify({mType: 'usersOnline', data: n}));
//connection.send(JSON.stringify({mType: 'uID', data: id}));

const testName = 'vasya';

document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket(`ws://localhost:5000?userName=${testName}`);
  socket.addEventListener('message', event => {
    const messageFromServer = event.data;
    const message = JSON.parse(messageFromServer);
    console.log(message);
  });
});
