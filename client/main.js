'use strict';
import { loadView, changeHash } from './spa/spaControl.js'
import { changeLanguage } from './changeLanguage.js'
import { de } from '../localization/de.js'
import { ua } from '../localization/ua.js'
import parseBundle from './gameLogic/parseBundle.js';

//messages from server
//client.send(JSON.stringify({mType: 'usersOnline', data: n}));
//connection.send(JSON.stringify({mType: 'uID', data: id}));

let socket = undefined;

//this config function returns function by mType of message, that came from socket
const socketHandleConfig = mType => ({
  'AAAAAAAAAAAAAAAAAAA': console.log,
})[mType];

//executes function returned by socketHandleConfig
function socketHandle(msg) {
  if (!socketHandleConfig(msg.data.mType)) return;
  socketHandleConfig(msg.data.mType)();
}

const startGame = () => {
  const roomName = document.getElementById('roomName').value;
  const password = document.getElementById('roomPassword').value;
  const questionBundle = document.getElementById('questionBundle');
  const gameMode = document.getElementById('gameMode').value;
  const role = document.getElementById('role').value;
  const totalPlayers = document.getElementById('totalPlayers').value;
  const ppl = document.getElementById('ppl').value;
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  if (!reg.test(roomName)) return;
  if (questionBundle.value === 'Download') {
    const bundleFileImport = document.getElementById('bundle-file');
    const file = bundleFileImport.files[0];
    if (!file) return;
    const f = new FileReader();
    f.onload = (e) => {
      const bundleObj = JSON.parse(e.target.result);
      console.log(bundleObj);
      const bundle = parseBundle(bundleObj);
    }
    f.readAsText(file);
    console.log(file);
  }
  console.log(
    roomName, 
    password,
    questionBundle,
    gameMode,
    role,
    totalPlayers,
    ppl,
    );
};

//connects user to webSocket server, sets up socket msg events, sends userName to WS server
const connectToSIgame = () => {
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  const name = document.getElementById('name-input').value;
  if (!reg.test(name)) return;
  changeHash('chooseMode')();
  socket = new WebSocket(`ws://localhost:5000?userName=${name}`);
  socket.onopen = () => {
    socket.onclose = () => {
      //disconnect();
      console.log('closed');
    };
    socket.onmessage = msg => {
      socketHandle(JSON.parse(msg.data));
      console.log(JSON.parse(msg.data));
    };
  };
};

//config function returns handlers by id
const handleClick = evt => ({
  'create-game-btn': [changeHash('createGame')],
  'play-btn': [connectToSIgame],
  'de': [changeLanguage(de)],
  'ua': [changeLanguage(ua)],
  'startGame': [() => alert('startGame'), startGame],
  'join-btn': [ () => changeHash('lobbySearch')()],
})[evt.target.id];


// it runs click handler if it exists
document.addEventListener('click', evt => {
  if (!handleClick(evt)) return;
  handleClick(evt).forEach(x => x());
});


//opens main page
loadView();
//switches pages 
window.onhashchange = loadView;
