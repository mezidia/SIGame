'use strict';

import Game from './gameLogic/game_class.js';
import User from './gameLogic/user_class.js';
import BundleEditor from './gameLogic/bundleEditor_class.js';
import SimpleGame from './gameLogic/simpleGame_class.js';
import { loadView, changeHash, checkView, getHash, getController, сontrollersConfig } from './spa/spaControl.js';
import { changeLanguage, language } from './changeLanguage.js';
import { promisifySocketMSG } from './utils.js';
import { errPopup } from './spa/uiElements.js';

import { de } from '../localization/de.js';
import { ua } from '../localization/ua.js';


//singleton
const bundleEditor = new BundleEditor();

//storage
let socket = null;
let allBundles = null;
let roomId = undefined;
let game = null;
let allGames = {};
let gameInSearchLobby = null;
let storage = {
  socket,
  allBundles,
  roomId,
  game,
  allGames,
  gameInSearchLobby,
};
console.log(сontrollersConfig);
const reg = /[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+/;

//it runs click handler if it exists
// function setupListeners() {
//   const events = ['click', 'keydown', 'input', 'change'];
//   for (const event of events) {
//     document.addEventListener(event, async evt => {
//       const controller = getController();
//       console.log(`${evt.type} has handlers:`, controller.getHandlers(evt));
//       const handlersArr = controller.getHandlers(evt);
//       if (!handlersArr) return;
//       console.log(handlersArr);
//       for await(const handler of handlersArr) {
//         console.log(handler);
//         handler(evt);
//       }
//     });
//   }

// }

// setupListeners();

function disconnect() {
  if (game) game.exit();
}

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
  namesOfAllPlayersDiv.innerHTML = '';
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
  const gameModeSelect = document.getElementById('gameMode');
  const totalPlayers = document.getElementById('totalPlayers').value;
  if (!reg.test(roomName)) return;

  const gameMode = gameModeSelect.options[gameModeSelect.selectedIndex]
    .attributes['data-localize'].textContent
    .split('-')[0];

  data.settings = {
    roomName,
    password,
    gameMode,
    totalPlayers,
    master: new User().name,
    hasPassword: password ? true : false,
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
      game = gameMode === 'classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
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
    game = gameMode === 'classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
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
    game = gameMode === 'classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
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
      disconnect();
      console.log('closed');
    };
    socket.onmessage = msg => {
      console.log(JSON.parse(msg.data));
      socketHandle(JSON.parse(msg.data));
    };
  };
}

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
      disconnect();
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
const sendMessageToGameChat = msg => {
  const data = msg.data;
  const chatField = document.getElementById('chat');
  const message = document.createElement('div');
  message.innerHTML = `
    <p style="margin-bottom: 0">${data.name}</p>
    <div class="message">${data.message}</div>
  `;
  chatField.appendChild(message);
  scrollToBottom(chatField);
}

 //function for scrolling div to end
 const scrollToBottom = (e) => {
  e.scrollTop = e.scrollHeight - e.getBoundingClientRect().height;
}

//config function returns handlers by id
const handleClick = evt => {
  let funcs = {
    'help': [changeHash('help')],
    'home': [changeHash('')],
    'dju': [changeHash('')],
    'all-players': [showPlayers],
    'create-game-btn': [createGameLobby],
    'play-btn': [connectToSIgame],
    'de': [changeLanguage(de)],
    'ua': [changeLanguage(ua)],
    'startGame': [createGame],
    'join-btn': [joinLobby],
    'openEditor-btn': [openEditor],
    'submitBundleEditor-btn': [bundleEditor.submitBundleEditor, changeHash('')],
    'ref_help-rules': [scrollToRef('ref_help-rules')],
    'ref_help-questions': [scrollToRef('ref_help-questions')],
    'ref_help-bug': [scrollToRef('ref_help-bug')],
    'close-popup': [() => {
      document.getElementById('popupPlaceholder').innerHTML = '';
    }],
    'exit-game-btn': [() => {
      if(game) game.exit();
      window.location.replace('#chooseMode');
      document.getElementById('popupPlaceholder').innerHTML = '';
    }],
  }[evt.target.id];
  if (!funcs) {
    funcs = {
      'scroll-to': [scrollToRef(evt.target.id)],
      'scroll-direct': [evt.target.scrollIntoView],
      'collapse-control': [collapseControl(evt.target.id)],
      'go-up-btn': [scrollToStart],
    }[evt.target.classList[0]]
  }
  return funcs;
}

//config function returns handlers by id
const handleChange = evt => ({
  'questionBundle': [onBundleCheckChange],
  'type-of-password': [onTypeOfPasswordChange],
  'select-games-by-type': [sortGames],
})[evt.target.id];

//config function returns handlers by id
const handleInput = evt => ({
  'find-games': [sortGames],
  'bundleSearch-input': [onBundleSearchInput],
})[evt.target.id];

function onBundleSearchInput() {
  const bundleSearchAutocomp = document.getElementById('bundleSearch-input-autocomplete');
  const hide = () => {
    document.removeEventListener('click', hide);
    bundleSearchAutocomp.style.display = 'none';
  }
  if (bundleSearchAutocomp.innerHTML === "") {
    document.addEventListener('click', hide);
  }
  bundleSearchAutocomp.innerHTML = "";
  const input = document.getElementById('bundleSearch-input').value;
  const bundles = allBundles;
  for (let i in bundles) {
    const comp = bundles[i].title.substring(0, input.length);
    if (comp.toLowerCase() === input.toLowerCase()) {
      const autocomp = document.createElement('div');
      autocomp.innerHTML = bundles[i].title;
      autocomp.setAttribute('class', 'bundle-search-input-autocomplete');
      bundleSearchAutocomp.appendChild(autocomp);
      autocomp.addEventListener('click', () => {
        document.getElementById('bundleSearch-input').value = autocomp.innerText;
        hide();
      })
    }
  }
  bundleSearchAutocomp.style.display = 'block';
  let i = -1;
  document.getElementById('bundleSearch-input').addEventListener('keydown', evt => {
    if (evt.code === 'ArrowDown') {
      i++;
      if (i >= bundleSearchAutocomp.children.length) i = 0;
      bundleSearchAutocomp.children[i].style.backgroundColor = '#d4d4d4';
      for (let j = 0; j < bundleSearchAutocomp.children.length; j++) {
        if (i !== j) {
          bundleSearchAutocomp.children[j].style.backgroundColor = 'white';
        }
      }
    } else if (evt.code === 'ArrowUp') {
      i--;
      if (i < 0) i = bundleSearchAutocomp.children.length - 1;
      bundleSearchAutocomp.children[i].style.backgroundColor = '#d4d4d4';
      for (let j = 0; j < bundleSearchAutocomp.children.length; j++) {
        if (i !== j) {
          bundleSearchAutocomp.children[j].style.backgroundColor = 'white';
        }
      }
    } else if (evt.code === 'Enter') {
      evt.preventDefault();
      bundleSearchAutocomp.children[i].click();
    }
  });
}

function sortGames() {
  const input = document.getElementById('find-games').value;
  const sortParameter = document.getElementById('select-games-by-type').value;
  const games = allGames.data;
  for (let i in games) {
    if (sortParameter === 'nopass') {
      if (games[i].settings.hasPassword) {
        document.getElementById(i).style.display = 'none';
        continue;
      }
    } else if (sortParameter === 'pass')  {
      if (!games[i].settings.hasPassword) {
        document.getElementById(i).style.display = 'none';
        continue;
      }
    }
    const comp = games[i].settings.roomName.substring(0, input.length);
    if (comp !== input) document.getElementById(i).style.display = 'none';
    else document.getElementById(i).style.display = 'block';
  }
}

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
}

//update games in lobby
const updateGames = data => {
  const games = data.data;
  const gamesSearchField = document.getElementById('games-search');
  allGames = data;
  if (!gamesSearchField) return;
  gamesSearchField.innerHTML = '';
  for (const gameId in games) {
    const gm = games[gameId];
    const gameDiv = document.createElement('div');
    gameDiv.setAttribute('id', gameId);
    gameDiv.addEventListener('click', () => gameDivOnClick(gameId, gm));
    gameDiv.innerHTML = gm.settings.roomName;
    gamesSearchField.appendChild(gameDiv);
    if (gameInSearchLobby === gameId) gameDiv.click();
    else hideGameInfoDiv();
  }
  if (Object.keys(allGames.data).length === 0) hideGameInfoDiv();
  sortGames();
}

function hideGameInfoDiv() {
  document.getElementById('picture-info-2').style.display = 'none';
  document.getElementById('picture-info-1').style.display = 'block';
}

function showGameInfoDiv() {
  document.getElementById('picture-info-2').style.display = 'block';
  document.getElementById('picture-info-1').style.display = 'none';
}

function gameDivOnClick(gameId, gm) {
  let gameData = null;
  const joinGame = () => joinHandle(gameData);
  gameInSearchLobby = gameId;
  const searchTitle = document.getElementById('search-title');
  searchTitle.setAttribute('class', gameId);
  showGameInfoDiv();
  gameData = {game: gm, id: gameId};
  if (gm.settings.hasPassword) document.getElementById('password-to-enter').style.display = 'block';
  else document.getElementById('password-to-enter').style.display = 'none';
  document.getElementById('join-player').removeEventListener('click', joinGame);
  document.getElementById('search-players').innerHTML = Object.keys(gm.players).length + ' / ' + gm.settings.totalPlayers;
  document.getElementById('search-title').innerHTML = gm.settings.roomName;
  document.getElementById('search-gm').innerHTML = gm.settings.master;
  document.getElementById('search-mode').innerHTML = gm.settings.gameMode;
  document.getElementById('search-question-bundle').innerHTML = gm.bundle.title;
  if (gm.settings.running) {
    document.getElementById('search-password').style.display = 'none';
    document.getElementById('game-running').style.display = 'block';
  } else {
    if(gm.settings.hasPassword) document.getElementById('search-password').style.display = 'block';
    document.getElementById('join-player').addEventListener('click', joinGame);
    document.getElementById('game-running').style.display = 'none';
  }
}

//this is handle, which is being called when join to game
async function joinHandle(gameData) {
  const gm = gameData.game;
  const gmId = gameData.id;
  const passwordInput = document.getElementById('search-password').value;
  const passwordGame = gm.settings.password;
  if (gm.settings.hasPassword && passwordInput !== passwordGame) return;
  if (gm.settings.running) return;
  if (gm.players.includes(new User().name)) {
    errPopup('username taken!');
    return;
  }
  if (Object.keys(gm.players).length >= gm.settings.totalPlayers) return;
  await changeHash(`simpleLobby/roomID=${gmId}`)();
  socket.send(JSON.stringify({mType: 'joinGame', data: {id: gmId}}));
  roomId = gmId;
  game = gm.settings.gameMode === 'classic' ? new Game(gm.bundle, gm.settings, gm.players) : new SimpleGame(gm.bundle, gm.settings, gm.players);
  game.setID(gmId);
  game.join();
  console.log('joined game', game);
}

//this func handles keydowns on elements
const handleKeydown = evt => ({
  'message-input': [sendMessageRoom],
})[evt.target.id];


// //it runs click handler if it exists
document.addEventListener('click', async evt => {
  if (!handleClick(evt)) return;
  for await(const clickEvent of handleClick(evt)) {
    clickEvent();
  }
});

//it runs click handler if it exists
// document.addEventListener('click', async evt => {
//   const controller = getController();
//   console.log('controller.getHandlers(evt)', controller.getHandlers(evt), !controller.getHandlers(evt));
//   const handlersArr = controller.getHandlers(evt);
//   if (!handlersArr) return;
//   console.log(handlersArr)
//   for await(const handler of handlersArr) {
//     console.log(handler)
//     handler(evt);
//   }
// });

// it runs click handler if it exists
document.addEventListener('change', async evt => {
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
});

// it runs keydown handler if it exists
document.addEventListener('input', async evt => {
  if (!handleInput(evt)) return;
  for await(const inputEvent of handleInput(evt)) {
    inputEvent(evt);
  }
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
    if (roomId) {
      game.exit();
      socket.send(JSON.stringify({mType: 'leaveGame', data: { roomID: roomId }}));
    }
    roomId = undefined;
    changeHash('chooseMode')();
  }
}

const scrollToRef = id => () => {
  document.getElementById(id.split('_')[1]).scrollIntoView();
}

const collapseControl = id => () => {
  const target = document.getElementById(id.split('_')[1]);
  if(target.classList.contains('show')) {
    target.classList.remove('show');
  } else {
    target.classList.add('show');
  }
}

// made recursive to be triggered on clicking both div and svg picture
const scrollToStart = () => {
  window.scrollTo(0, 0)
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
window.onbeforeunload = () => disconnect();

export { game, storage };
