'use strict';

import { loadView, changeHash, checkView, getHash, getController, сontrollersConfig, page } from './spa/spaControl.js';
import { disconnect } from './spa/viewsControllers/externalControlersFunctions.js';

//storage
let socket = null;
let allBundles = null;
let bundlesMeta = [];
let roomId = undefined;
let game = null;
let allGames = {};
let gameInSearchLobby = null;
let storage = {
  socket,
  allBundles,
  bundlesMeta,
  roomId,
  game,
  allGames,
  gameInSearchLobby,
};

console.log(сontrollersConfig);

//it runs handler if it exists
function setupListeners() {
  const events = ['click', 'keydown', 'input', 'change'];
  for (const event of events) {
    document.addEventListener(event, async evt => {
      let controller = getController();
      console.log(`${evt.type} has handlers:`, controller.getHandlers(evt));
      let handlersArr = controller.getHandlers(evt);
      if (!handlersArr) {
        controller = getController('StaticElementsController');
        console.log(`${evt.type} has handlers:`, controller.getHandlers(evt));
        handlersArr = controller.getHandlers(evt);
      }
      if (!handlersArr) return;
      console.log(handlersArr);
      for await(const handler of handlersArr) {
        console.log(handler);
        handler(evt);
      }
    });
  }

}

setupListeners();


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
