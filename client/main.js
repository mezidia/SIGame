'use strict';

import Game from './gameLogic/game_class.js';
import User from './gameLogic/user_class.js';
import BundleEditor from './gameLogic/bundleEditor_class.js';
import { loadView, changeHash, checkView, loadMainView, getHash } from './spa/spaControl.js';
import { changeLanguage, language } from './changeLanguage.js';
import { promisifySocketMSG } from './utils.js';

import { de } from '../localization/de.js';
import { ua } from '../localization/ua.js';

//singleton
const bundleEditor = new BundleEditor();

//storage
let socket = undefined;
let allBundles = undefined;
let roomId = undefined;
let game = undefined;
let allGames = {};
const reg = /[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+/; 

//this config function returns function by mType of message, that came from socket
const socketHandleConfig = mType => ({
  'usersOnline': data => onUsersOnline(data),
  'messageToGameChat': data => sendMessageToGameChat(data),
  'returnAllGames': data => updateGames(data),
})[mType];

const onUsersOnline = data => {
  const numberOfAllPlayersDiv = document.getElementById('number-of-players-online'); 
  numberOfAllPlayersDiv.innerHTML = data.data.names.length;
  const namesOfAllPlayersDiv = document.getElementById('names-of-players-online');
  for (let name of data.data.names) {
    const playerDiv = document.createElement('div');
    playerDiv.innerText += name + '\n';
    namesOfAllPlayersDiv.appendChild(playerDiv);
  }
}

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
  const totalPlayers = document.getElementById('totalPlayers').value;
  if (!reg.test(roomName)) return;
  data.settings = {
    roomName,
    password,
    gameMode,
    totalPlayers,
    master: new User().name,
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
      game = new Game(data.bundle, data.settings);
      const msg = {
        'mType': 'newGameLobby',
        data,
      };
      promisifySocketMSG(msg, 'newLobbyId', socket).then(async (msg) => {
        roomId = msg.data.id;
        await changeHash(`simpleLobby/roomID=${roomId}`)();
        game.init();
        game.setID(msg.data.id);
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
    game = new Game(data.bundle, data.settings);
    const msg = {
      'mType': 'newGameLobby',
      data,
    };
    promisifySocketMSG(msg, 'newLobbyId', socket).then(async (msg) => {
      roomId = msg.data.id;
      await changeHash(`simpleLobby/roomID=${roomId}`)();
      game.init();
      game.setID(msg.data.id);
    });
  } else {
    data.bundle = bundleEditor.getRandomBundleFrom(allBundles, language.json.code);
    game = new Game(data.bundle, data.settings);
    const msg = {
      'mType': 'newGameLobby',
      data,
    };
    promisifySocketMSG(msg, 'newLobbyId', socket).then(async (msg) => {
      roomId = msg.data.id;
      await changeHash(`simpleLobby/roomID=${roomId}`)();
      game.setID(msg.data.id);
      game.init();
      console.log(game);
    });
  }

};

const createGameLobby = () => {
  const msg = {
    'mType': 'getAllBundles',
  };
  promisifySocketMSG(msg, 'allBundles', socket).then(msg => {
    allBundles = msg.data;
    for (const i in allBundles) {
      allBundles[i] = bundleEditor.parseBundle(allBundles[i]);
    }
    console.log(allBundles);
    changeHash('createGame')();
  });
}

//connects user to webSocket server, sets up socket msg events, sends userName to WS server
const connectToSIgame = () => {
  const name = document.getElementById('name-input').value;
  if (!reg.test(name)) return;
  window.localStorage.setItem('name', name);
  changeHash('chooseMode')();
  socket = new WebSocket(`ws://localhost:5000`);
  socket.onopen = () => {
    new User(name, socket);
    socket.send(JSON.stringify({mType: 'sendName', data: {name: name}}));
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
  if (!reg.test(name)) return;
  window.localStorage.setItem('name', name);
  changeHash('redactor')();
  socket = new WebSocket(`ws://localhost:5000?userName=${name}`);
  socket.onopen = () => {
    new User(name, socket);
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
}

//this func sends message to other members of room
const sendMessageRoom = e => {
  if (e.key !== 'Enter') return;
  const inputFieldData = document.getElementById('message-input').value;
  const reg = /.+/;//--------------------------------------------------------------------------
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

const onHelp = () => {
  changeHash('help')();
}

const onHome = () => {
  changeHash('home')();
}

//config function returns handlers by id
const handleClick = evt => ({
  'help': [onHelp],
  'home': [onHome],
  'dju': [onHome],
  'all-players': [showPlayers],
  'create-game-btn': [createGameLobby],
  'play-btn': [connectToSIgame],
  'de': [changeLanguage(de)],
  'ua': [changeLanguage(ua)],
  'startGame': [createGame],
  'join-btn': [joinLobby],
  'openEditor-btn': [openEditor],
  'submitBundleEditor-btn': [bundleEditor.submitBundleEditor, changeHash('')],
  'go-up-btn': [scrollToStart()],
  'ref_help-rules': [scrollToElem('ref_help-rules')],
  'ref_help-questions': [scrollToElem('ref_help-questions')],
  'ref_help-bug': [scrollToElem('ref_help-bug')],
})[evt.target.id];

//config function returns handlers by id
const handleChange = evt => ({
  'questionBundle': [onBundleCheckChange],
  'type-of-password': [onTypeOfPasswordChange],
})[evt.target.id];

//shows input on password when create game
const onTypeOfPasswordChange = evt => {
  let roomInputPassword = document.getElementById('roomPassword');
  const caseConfig = {
    'nopass': () => { roomInputPassword.style.display = 'none'; },
    'pass': () => { roomInputPassword.style.display = 'block'; },
  }
  const handler = caseConfig[evt.target.value];
  if (!handler) return;
  handler();
}

//shows div with players
const showPlayers = () => {
  const allPlayersDiv = document.getElementById('all-players-div');
  if (allPlayersDiv.style.display === 'none') allPlayersDiv.style.display = 'block';
  else allPlayersDiv.style.display = 'none';
}

//join-btn click handle
const joinLobby = async () => {
  await changeHash('lobbySearch')();
  updateGames(allGames);
  const findGames = document.getElementById('find-games');
  findGames.addEventListener('input', () => {
    console.log(findGames.value);
    const input = findGames.value;
    const games = allGames.data;
    for (let i in games) {
      const comp = games[i].settings.roomName.substring(0, input.length);
      if (comp !== input) document.getElementById(i).style.display = 'none';
      else document.getElementById(i).style.display = 'block';
    }
  });
}

//update games in lobby
const updateGames = data => {
  console.log(data);
  const games = data.data;
  const gamesSearchField = document.getElementById('games-search');
  allGames = data;
  if (!gamesSearchField) return;
  if (Object.keys(allGames.data).length === 0) {
    document.getElementById('picture-info-2').style.display = 'none';
    document.getElementById('picture-info-1').style.display = 'block';
  }
  gamesSearchField.innerHTML = '';
  let gameData = null;
  const joinGame = () => joinHandle(gameData);
  for (const gameId in games) {
    const gm = games[gameId];
    const gameDiv = document.createElement('div');
    gameDiv.setAttribute('id', gameId);
    gameDiv.addEventListener('click', () => {
      const searchTitle = document.getElementById('search-title');
      searchTitle.setAttribute('class', gameId);
      document.getElementById('picture-info-1').style.display = 'none';
      document.getElementById('picture-info-2').style.display = 'block';
      gameData = {game: gm, id: gameId};
      document.getElementById('join-player').removeEventListener('click', joinGame);
      document.getElementById('search-players').innerHTML = Object.keys(gm.players).length + ' / ' + gm.settings.totalPlayers;
      document.getElementById('search-title').innerHTML = gm.settings.roomName;
      document.getElementById('search-gm').innerHTML = gm.settings.master;
      document.getElementById('search-mode').innerHTML = gm.settings.gameMode;
      document.getElementById('search-question-bundle').innerHTML = gm.bundle.title;
      document.getElementById('join-player').addEventListener('click', joinGame);
    });
    gameDiv.innerHTML = gm.settings.roomName;
    gamesSearchField.appendChild(gameDiv);
  }
  const searchTitle = document.getElementById('search-title');
  if (!Object.keys(allGames).includes(searchTitle.classList[0])) {
    document.getElementById('picture-info-2').style.display = 'none';
    document.getElementById('picture-info-1').style.display = 'block';
  }

}

//add info about games
//function addGa

//this is handle, which is being called when join to game
async function joinHandle(gameData) {
  const gm = gameData.game;
  const gmId = gameData.id;
  console.log('game data ', gameData);
  const passwordInput = document.getElementById('search-password').value;
  const passwordGame = gm.settings.password;
  if (passwordInput !== passwordGame) return;
  if (Object.keys(gm.players).length >= gm.settings.totalPlayers) return;
  await changeHash(`simpleLobby/roomID=${gmId}`)();
  socket.send(JSON.stringify({mType: 'joinGame', data: {id: gmId}}));
  roomId = gmId;
  game = new Game(gm.bundle, gm.settings, gm.players);
  game.setID(gmId);
  game.join();
  console.log('joined game', game);
}

//this func handles keydowns on elements
const handleKeydown = evt => ({
  'message-input': [sendMessageRoom],
})[evt.target.id];

// it runs click handler if it exists
document.addEventListener('click', async evt => {
  if (!handleClick(evt)) return;
  for await(const clickEvent of handleClick(evt)) {
    clickEvent()
  }
});

// it runs click handler if it exists
document.addEventListener('change', async evt => {
  console.log(evt.target.id);
  if (!handleChange(evt)) return;
  for await(const changeEvent of handleChange(evt)) {
    changeEvent(evt);
  }
});

// it runs keydown handler if it exists
document.addEventListener('keydown', async evt => {
  if (!handleKeydown(evt)) return;
  for await(const keyDownEvent of handleKeydown(evt)) {
    keyDownEvent(evt);
  }
  // handleKeydown(evt).forEach(x => x(evt));
});

const onBundleCheckChange = evt => {
  let fileInputDisplay = document.getElementById('bundle-file');
  let textInputDisplay = document.getElementById('bundleSearch-input');
  const caseConfig = {
    'random': () => { fileInputDisplay.style.display = 'none'; textInputDisplay.style.display = 'none'; },
    'download': () => { fileInputDisplay.style.display = 'block'; textInputDisplay.style.display = 'none'; },
    'findByName': () => { fileInputDisplay.style.display = 'none'; textInputDisplay.style.display = 'block'; },
  }
  const handler = caseConfig[evt.target.value];
  if (!handler) return;
  handler();
}

function checkHash(e) {
  const name = checkView();
  if (name === 'lobbySearch' || name === 'createGame' || name === 'simpleLobby') {
    changeHash('chooseMode')();
    if (roomId) {
      game.exit();
      socket.send(JSON.stringify({mType: 'leaveGame', data: { roomID: roomId }}));
    }
    roomId = undefined;
  }
}

const scrollToElem = id => () => {
  document.getElementById(id.split('_')[1]).scrollIntoView();
}

// made recursive to be triggered on clicking both div and svg picture
const scrollToStart = () => {
  window.scrollTo(0, 0)
  return scrollToStart;
}

// won't pass user to other than main and help pages if socket is not connected
const loadViewSocket = e => {
  if(getHash() === 'help') {
    loadView();
    return;
  }

  if(socket) {
    loadView();
  } else {
    changeHash('')();
  }
}

const checkGoUp = () => {
  if(!document.getElementById('go-up-btn')) {
    return
  }
  if(window.scrollY >= 20) {
    document.getElementById('go-up-btn').style.display = 'flex';
  } else {
    document.getElementById('go-up-btn').style.display = 'none';
  }
}

//opens main page
loadViewSocket();
//switches pages
window.addEventListener('hashchange', e => loadViewSocket(e));
window.addEventListener('popstate', e => checkHash(e));
window.addEventListener('scroll', checkGoUp);
window.onload = () => {
  const name = window.localStorage.getItem('name');
  if (name) document.getElementById('name-input').value = name;
}
export { game };
