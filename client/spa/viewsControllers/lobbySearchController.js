'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js';
import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';

const bundleEditor = new BundleEditor();

export default class LobbySearchController {

  clickConfig = {
    'submitBundleEditor-btn': [bundleEditor.submitBundleEditor, changeHash('')],

  }

  changeConfig = {
    'questionBundle': [this.onBundleCheckChange],
    'type-of-password': [this.onTypeOfPasswordChange],
    'select-games-by-type': [this.sortGames],
  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  onBundleCheckChange(evt) {
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

  onTypeOfPasswordChange(evt) {
    let roomInputPassword = document.getElementById('roomPassword');
    const caseConfig = {
      'nopass': () => { roomInputPassword.style.display = 'none'; },
      'pass': () => { roomInputPassword.style.display = 'block'; },
    }
    const handler = caseConfig[evt.target.value];
    if (!handler) return;
    handler();
  }

  sortGames() {
    const input = document.getElementById('find-games').value;
    const sortParameter = document.getElementById('select-games-by-type').value;
    const games = storage.allGames.data;
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

}
