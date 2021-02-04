'use strict';
import {loadView} from './spa/spaControl.js'
//messages from server
//client.send(JSON.stringify({mType: 'usersOnline', data: n}));
//connection.send(JSON.stringify({mType: 'uID', data: id}));

let socket = undefined;
//socket msg handlers
const handleSocket = mType => ({
  'AAAAAAAAAAAAAAAAAAA': console.log,
})[mType];

function sockethandle(msg) {
  if (handleSocket(msg.data.mType) === undefined) {
    return;
  } else {
    handleSocket(msg.data.mType)();
  }
}

const connectToSIgame = (name) => {
  socket = new WebSocket(`ws://localhost:5000?userName=${name}`);
  socket.onopen = () => {
    socket.onclose = () => {
      //disconnect();
      console.log('closed');
    };
    socket.onmessage = msg => {
      sockethandle(JSON.parse(msg.data));
      console.log(JSON.parse(msg.data));
    };
  };
};


const handleClick = evt => ({
  'AAAAAAAAAAAAAAAAAAA': connectToSIgame('vasya'),
})[evt.target.id];

document.addEventListener('click', evt => {
  if (handleClick(evt) === undefined) {
    return;
  } else {
    handleClick(evt)();
  }
});
loadView();
document.onchange = loadView();