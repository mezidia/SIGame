'use strict';

import { loadView, changeHash, checkView, getHash, getController } from './spa/spaControl.js';
import { disconnect } from './spa/viewsControllers/externalControlersFunctions.js';

//storage
let storage = {
  socket: null,
  allBundles: null,
  bundlesMeta: [],
  roomId: undefined,
  game: null,
  allGames: null,
  gameInSearchLobby: null,
};

//it runs handler if it exists
function setupListeners() {
  const events = ['click', 'keydown', 'input', 'change'];
  for (const event of events) {
    document.addEventListener(event, async evt => {
      let controller = getController();
      let handlersArr = controller.getHandlers(evt);
      if (!handlersArr) {
        controller = getController('StaticElementsController');
        handlersArr = controller.getHandlers(evt);
      }
      if (!handlersArr) return;
      for await(const handler of handlersArr) {
        handler(evt);
      }
    });
  }

}

setupListeners();

function checkHash(e) {
  const name = checkView();
  if (name === 'lobbySearch' || name === 'createGame' || name === 'simpleLobby') {
    if (storage.roomId) {
      storage.game.exit();
      storage.socket.send(JSON.stringify({mType: 'leaveGame', data: { roomID: storage.roomId }}));
    }
    storage.roomId = undefined;
    changeHash('chooseMode')();
  }
}

// won't pass user to other than main and help pages if socket is not connected
const loadViewSocket = e => {
  if(getHash() === 'help') loadView();
  else if (storage.socket) loadView();
  else changeHash('')();
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
window.addEventListener('hashchange', e => loadViewSocket(e), false);
window.addEventListener('popstate', e => checkHash(e));
window.addEventListener('scroll', checkGoUp);
window.onload = () => () => {
  const name = window.localStorage.getItem('name');
  if (name) document.getElementById('name-input').value = name;
}
window.onbeforeunload = () => disconnect();

export { storage };
