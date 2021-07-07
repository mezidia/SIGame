'use strict';

import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';
import { takeName, disconnect, socketHandle, updateGames, sendMessageToGameChat} from './externalControlersFunctions.js';
import User from "../../gameLogic/user_class.js";

const socketHandleConfig = mType => {
  return {
    'usersOnline': () => {}, // onUsersOnline
    'messageToGameChat': data => sendMessageToGameChat(data),
    'returnAllGames': data => updateGames(data),
  }[mType];
};

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

  connectToSIgame() {
    if (storage.socket) disconnect();
    const name = takeName();
    if (takeName() === null) return;
    changeHash('chooseMode')();
    storage.socket = new WebSocket(`wss://our-si-game.herokuapp.com`);
    storage.socket.onopen = () => {
      const user = new User(name, storage.socket);
      user.setSocket(storage.socket);
      user.setName(name);
      storage.socket.send(JSON.stringify({mType: 'sendName', data: {name: name}}));
      storage.socket.send(JSON.stringify({mType: 'returnAllGames', data: {}}));
      storage.socket.onclose = () => {
        disconnect();
        console.log('closed');
      };
      storage.socket.onmessage = msg => {
        console.log(JSON.parse(msg.data));
        socketHandle(JSON.parse(msg.data), socketHandleConfig);
      };
    };
  }

  openEditor() {
    if (storage.socket) disconnect();
    const name = takeName();
    if (takeName() === null) return;
    storage.socket = new WebSocket(`wss://our-si-game.herokuapp.com`);
    changeHash('redactor')();
    storage.socket.onopen = () => {
      const user = new User(name, storage.socket);
      user.setSocket(storage.socket);
      user.setName(name);
      storage.socket.send(JSON.stringify({mType: 'returnAllGames', data: {}}));
      storage.socket.onclose = () => {
        disconnect();
        console.log('closed');
      };
      storage.socket.onmessage = msg => {
        console.log(JSON.parse(msg.data));
        socketHandle(JSON.parse(msg.data), socketHandleConfig);
      };
    };
  }

}
