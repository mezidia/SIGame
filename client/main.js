'use strict';

import Game from './gameLogic/game_class.js';
import Bundle from './gameLogic/bundle_class.js';
import promisifySocketMSG from './gameLogic/promosifySocketMSG.js';
import submitBundleEditor from './gameLogic/submitBundleEditor.js';
import BundleEditor from './gameLogic/bundleEditor_class.js';
import { loadView, changeHash } from './spa/spaControl.js';
import { changeLanguage, language } from './changeLanguage.js';
import { getRandomIntInclusive } from './utils.js';
import { de } from '../localization/de.js';
import { ua } from '../localization/ua.js';

const bundleEditor = new BundleEditor();

//messages from server
//client.send(JSON.stringify({mType: 'usersOnline', data: n}));
//{mType: 'newChatId', data: {id: id}}

let socket = undefined;
let allBundles = undefined;
let roomId = undefined;
let allGames = {};

//this config function returns function by mType of message, that came from socket
const socketHandleConfig = mType => ({
  'usersOnline': data => console.log(data),
  'messageToGameChat': data => sendMessageToGameChat(data),
  'returnAllGames': data => updateGames(data),
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
  data.settings = {
    roomName, 
    password,
    gameMode,
    role,
    totalPlayers,
    ppl,
  };
  console.log(questionBundle.value);
  if (questionBundle.value === 'download') {
    const bundleFileImport = document.getElementById('bundle-file');
    const file = bundleFileImport.files[0];
    if (!file) return;
    const f = new FileReader();
    f.onload = (e) => {
      const bundleObj = JSON.parse(e.target.result);
      data.bundle = bundleEditor.parseBundle(bundleObj);
      const game = new Game(data.bundle, data.settings);
      const msg = {
        'mType': 'newGameLobby',
        data,
      };
      promisifySocketMSG(msg, 'newChatId', socket).then((msg) => {
        roomId = msg.data.id;
        changeHash('simpleLobby')();
      });
    }
    f.readAsText(file);
  } else if (questionBundle.value === 'findByName') {
    const bundleTitle = document.getElementById('bundleSearch-input').value;
    for (const bundle of allBundles) {
      if (bundle.title === bundleTitle) {
        data.bundle = bundle;
        break;
      }
    }
    const game = new Game(data.bundle, data.settings);
    const msg = {
      'mType': 'newGameLobby',
      data,
    };
    promisifySocketMSG(msg, 'newChatId', socket).then((msg) => {
      roomId = msg.data.id;
      changeHash('simpleLobby')();
    });
  } else {
    const bundleData = {
      author: 'autogen',
      language: language.json.code,
      title: 'autogen',
      decks: [],
    };
    // get 15 regular decks
    for (let c = 0; c < 15; c++) {
      let bundle = undefined;  
      do {
        bundle = allBundles[getRandomIntInclusive(0, allBundles.length - 1)];
      } while (bundle.langcode !== bundleData.language);
      const deck = bundle.decks[getRandomIntInclusive(0, 14)];
      bundleData.decks.push(deck);
    }
    // get 7 final decks
    for (let c = 0; c < 7; c++) {
      let bundle = undefined;  
      do {
        bundle = allBundles[getRandomIntInclusive(0, allBundles.length - 1)];
      } while (bundle.langcode !== bundleData.language);
      const deck = bundle.decks[getRandomIntInclusive(15, 21)];
      bundleData.decks.push(deck);
    }
    console.log(bundleData.decks);
    data.bundle = new Bundle(bundleData);
    const game = new Game(data.bundle, data.settings);
    const msg = {
      'mType': 'newGameLobby',
      data,
    };
    promisifySocketMSG(msg, 'newChatId', socket).then((msg) => {
      roomId = msg.data.id;
      changeHash('simpleLobby')();
    });
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
    socket.send(JSON.stringify({mType: 'returnAllGames', data: {}}));
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

//this func sends message to other members of room
const sendMessageRoom = e => {
  if (e.key !== 'Enter') return;
  const inputFieldData = document.getElementById('message-input').value;
  const reg = /.+/; //--------------------------------------------------------------------------
  if (!reg.test(inputFieldData)) return;
  socket.send(JSON.stringify({mType: 'messageToGameChat', data: { message: inputFieldData, 'room': roomId}}));
  document.getElementById('message-input').value = '';
}

//this func handles message from another member in game chat
const sendMessageToGameChat = mess => {
  const data = mess.data;
  const chatField = document.getElementById('chat');
  const message = document.createElement('div');
  const name = document.createElement('p');
  const text = document.createElement('p');
  name.innerHTML = data.name + ': ';
  text.innerHTML = data.message;
  message.appendChild(name);
  message.appendChild(text);
  chatField.appendChild(message);
}

//config function returns handlers by id
const handleClick = evt => ({
  'create-game-btn': [createGameLobby],
  'play-btn': [connectToSIgame],
  'de': [changeLanguage(de)],
  'ua': [changeLanguage(ua)],
  'startGame': [createGame],
  'join-btn': [ () => changeHash('lobbySearch')(), () => updateGames(allGames)],
  'openEditor-btn': [openEditor],
  'submitBundleEditor-btn': [submitBundleEditor],
})[evt.target.id];

//update games in lobby
const updateGames = data => {
  setTimeout(() => {
    const games = data.data;
    const gamesSearchField = document.getElementById('games-search');
    allGames = data;
    if (!gamesSearchField) return;
    gamesSearchField.innerHTML = '';
    for (const gameId of Object.keys(games)) {
      const game = games[gameId];
      const gameDiv = document.createElement('div');
      gameDiv.addEventListener('click', () => {
        console.log(game.settings.roomName);
        document.getElementById('search-title').innerHTML = game.settings.roomName;
        document.getElementById('search-mode').innerHTML = game.settings.gameMode;
        document.getElementById('search-question-bundle').innerHTML = game.bundle.title;
      });
      gameDiv.innerHTML = game.settings.roomName;
      gamesSearchField.appendChild(gameDiv);
    }
  }, 100);
  
}

//this func handles keydowns on elements
const handleKeydown = evt => ({
  'message-input': [sendMessageRoom],
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

// it runs keydown handler if it exists
document.addEventListener('keydown', evt => {
  if (!handleKeydown(evt)) return;
  handleKeydown(evt).forEach(x => x(evt));
});

document.addEventListener('change', (evt) => {
  if (evt.target.id === 'questionBundle') {
    const fileInput = document.getElementById('bundle-file');
    const textInput = document.getElementById('bundleSearch-input');
    switch (evt.target.value) {
      case 'random':
        fileInput.style.display = 'none';
        textInput.style.display = 'none';
        break;
      case 'download':
        fileInput.style.display = 'block';
        textInput.style.display = 'none';
        break;
      case 'findByName':
        fileInput.style.display = 'none';
        textInput.style.display = 'block';
        break;
      default:
        break;
    }
  }
});

//opens main page
loadView();
//switches pages 
window.onhashchange = loadView;
