'use strict';

//messages from server
//client.send(JSON.stringify({mType: 'usersOnline', data: n}));
//connection.send(JSON.stringify({mType: 'uID', data: id}));

let socket = undefined;

//socket msg handlers
const connectToSIgame = (name) => {
  socket = new WebSocket(`ws://localhost:5000?userName=${name}`);
  socket.onopen = () => {
    socket.onclose = () => {
      //disconnect();
      console.log('closed');
    };
    socket.onmessage = msg => console.log(JSON.parse(msg.data));
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
