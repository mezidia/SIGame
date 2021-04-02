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
    console.log(this[configString][evt.target.id]);
    return this[configString][evt.target.id];
  }

  connectToSIgame() {
    const name = document.getElementById('name-input').value;
    if (!validator.isValidName(name)) return;
    window.localStorage.setItem('name', name);
    changeHash('chooseMode')();
    storage.socket = new WebSocket(`ws://localhost:5000`);
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
    storage.socket = new WebSocket(`ws://localhost:5000`);
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


