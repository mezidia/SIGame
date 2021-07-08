'use strict';

import { storage } from '../../main.js';
import { page } from '../spaControl.js';


export default class SimpleLobbyController {

  clickConfig = {
    'onleave': [this.leave],

  }

  keydownConfig = {
    'message-input': [this.sendMessageRoom],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  leave() {
    if (storage.game) storage.game.exit();
    window.location.replace('#' + page.next);
    document.getElementById('popupPlaceholder').innerHTML = '';
  }

  sendMessageRoom(e) {
    if (e.key !== 'Enter') return;
    const inputFieldData = document.getElementById('message-input').value;
    const reg = /.+/;//--------------------------------------------------------------------------
    if (!reg.test(inputFieldData)) return;
    storage.socket.send(JSON.stringify({mType: 'messageToGameChat', data: { message: inputFieldData, 'room': storage.roomId}}));
    document.getElementById('message-input').value = '';
  }

}