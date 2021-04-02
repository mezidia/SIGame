'use strict';

import { storage } from '../../main.js';
import StringValidator from '../../utils/stringValidator_class.js';

const validator = new StringValidator();

export default class MainPageController {

  static connectToSIgame = () => {
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

  static openEditor = () => {
    const name = document.getElementById('name-input').value;
    if (!validator.isValidName(name)) return;
    window.localStorage.setItem('name', name);
    changeHash('redactor')();
    storage.socket = new WebSocket(`ws://localhost:5000?userName=${name}`);
    storage.socket.onopen = () => {
      new User(name, storage.socket);
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
