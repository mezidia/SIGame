'use strict';

import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';
import User from "../../gameLogic/user_class.js";
import StringValidator from '../../utils/stringValidator_class.js';

const validator = new StringValidator();

export default class MainPageController {

  clickConfig = {
    'play-btn': [this.connectToSIgame],
    'openEditor-btn': [this.openEditor],

  }

  handlesConfig = {
    'click': this.clickConfig,

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  socketHandleConfig = mType => ({
    'usersOnline': data => onUsersOnline(data),
    'messageToGameChat': data => sendMessageToGameChat(data),
    'returnAllGames': data => updateGames(data),
  })[mType];

  onUsersOnline = data => {
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

  updateGames = data => {
    console.log(data);
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

  connectToSIgame() {
    const name = document.getElementById('name-input').value;
    if (!validator.isValidName(name)) return;
    window.localStorage.setItem('name', name);
    changeHash('chooseMode')();
    storage.socket = new WebSocket(`ws://our-si-game.herokuapp.com`);
    storage.socket.onopen = () => {
      new User(name, storage.socket);
      storage.socket.send(JSON.stringify({mType: 'sendName', data: {name: name}}));
      storage.socket.send(JSON.stringify({mType: 'returnAllGames', data: {}}));
      storage.socket.onclose = () => {
        //disconnect();
        console.log('closed');
      };
      storage.socket.onmessage = msg => {
        console.log(JSON.parse(msg.data));
        socketHandle(JSON.parse(msg.data));
      };
    };
  }

  openEditor() {
    console.log('openEditor');
    const name = document.getElementById('name-input').value;
    if (!validator.isValidName(name)) return;
    window.localStorage.setItem('name', name);
    changeHash('redactor')();
    storage.socket = new WebSocket(`ws://our-si-game.herokuapp.com`);
    storage.socket.onopen = () => {
      new User(name, storage.socket);
      storage.socket.send(JSON.stringify({mType: 'sendName', data: {name: name}}));
      storage.socket.send(JSON.stringify({mType: 'returnAllGames', data: {}}));
      storage.socket.onclose = () => {
        //disconnect();
        console.log('closed');
      };
      storage.socket.onmessage = msg => {
        console.log(JSON.parse(msg.data));
        socketHandle(JSON.parse(msg.data));
      };
    };
  }

}


