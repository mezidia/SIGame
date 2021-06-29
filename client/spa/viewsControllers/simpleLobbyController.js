'use strict';

import { storage } from '../../main.js';
import { page } from '../spaControl.js';


export default class SimpleLobbyController {

  clickConfig = {
    'onleave': [this.leave],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  leave() {
    if (storage.game) storage.game.exit();
    window.location.replace('#' + page.next);
    document.getElementById('popupPlaceholder').innerHTML = '';
  }

}