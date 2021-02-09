'use strict';

import Game from './gameLogic/game_class.js';
import promisifySocketMSG from './gameLogic/promosifySocketMSG.js';
import submitBundleEditor from './gameLogic/submitBundleEditor.js';
import BundleEditor from './gameLogic/bundleEditor_class.js';
import { loadView, changeHash } from './spa/spaControl.js';
import { changeLanguage } from './changeLanguage.js';
import { de } from '../localization/de.js';
import { ua } from '../localization/ua.js';

const bundleEditor = new BundleEditor();



//messages from server
//client.send(JSON.stringify({mType: 'usersOnline', data: n}));

let socket = undefined;
let allBundles = undefined;

//this config function returns function by mType of message, that came from socket
const socketHandleConfig = mType => ({
  'usersOnline': (data) => console.log(data),
})[mType];

//executes function returned by socketHandleConfig
function socketHandle(data) {
  if (!socketHandleConfig(data.mType)) return;
  socketHandleConfig(data.mType)(data);
}

const createGame = () => {
  const data = {};
  const roomName = document.getElementById('roomName').value;
  const password = document.getElementById('roomPassword').value;
  const questionBundle = document.getElementById('questionBundle');
  const gameMode = document.getElementById('gameMode').value;
  const role = document.getElementById('role').value;
  const totalPlayers = document.getElementById('totalPlayers').value;
  const ppl = document.getElementById('ppl').value;
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  if (!reg.test(roomName)) return;
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
  if (questionBundle.value === 'Download') {
    const bundleFileImport = document.getElementById('bundle-file');
    const file = bundleFileImport.files[0];
    if (!file) return;
    const f = new FileReader();
    f.onload = (e) => {
      const bundleObj = JSON.parse(e.target.result);
      const bundle = bundleEditor.parseBundle(bundleObj);
      const game = new Game(bundle, settings);
      const msg = {
        'mType': 'newGameLobby',
        data: {
          saveBundle: true,
          bundle,
          settings,
        },
      };
      socket.send(JSON.stringify(msg));
      changeHash('simpleLobby')();
    }
    f.readAsText(file);
  } else if (questionBundle.value === 'BundleByName') {
    const bundleSubject = document.getElementById('bundleSubjectSearch-input').value;
    for (const bundle of allBundles) {
      if (bundle.subject === bundleSubject) {
        data.bundle = bundle;
      }
    }

    changeHash('simpleLobby')();
  } else {
    
    changeHash('simpleLobby')();
  }

};

const createGameLobby = () => {
  const msg = {
    'mType': 'getAllBundles',
  };
  promisifySocketMSG(msg, 'allBundles', socket).then(msg => {
    allBundles = msg.data;
    console.log(allBundles);
    for (const bundleObj of allBundles) {
      console.log(bundleEditor.parseBundle(bundleObj));
    }
    changeHash('createGame')();
  });
}

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
      console.log(JSON.parse(msg.data));
      socketHandle(JSON.parse(msg.data));
    };
  };
};

const openEditor = () => {
  const name = document.getElementById('name-input').value;
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  if (!reg.test(name)) return;
  changeHash('redactor')();
}

//config function returns handlers by id
const handleClick = evt => ({
  'create-game-btn': [createGameLobby],
  'play-btn': [connectToSIgame],
  'de': [changeLanguage(de)],
  'ua': [changeLanguage(ua)],
  'startGame': [createGame],
  'join-btn': [ () => changeHash('lobbySearch')()],
  'openEditor-btn': [openEditor],
  'submitBundleEditor-btn': [submitBundleEditor],
})[evt.target.id];

document.addEventListener('animationend', (evt) => {
  if (evt.target.id === 'last-letter') {
    alert('Victory!!')
  }
})

// it runs click handler if it exists
document.addEventListener('click', evt => {
  if (!handleClick(evt)) return;
  handleClick(evt).forEach(x => x());
});

//opens main page
loadView();
//switches pages 
window.onhashchange = loadView;
