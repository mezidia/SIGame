'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js';
import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';
import { promisifySocketMSG } from '../../utils.js';
import { loader } from '../../utils/loader.js';

const bundleEditor = new BundleEditor();

export default class ChooseModeController {

  clickConfig = {
    'create-game-btn': [this.createGameLobby],
    'join-btn': [this.joinLobby],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  //join-btn click handle
  async joinLobby() {
    await changeHash('lobbySearch')();
    updateGames(storage.allGames);
  }

  createGameLobby() {
    loader();
    const msg = {
      'mType': 'getAllBundles',
    };
    promisifySocketMSG(msg, 'allBundles', socket).then(msg => {
      storage.allBundles = msg.data;
      for (const i in allBundles) {
        allBundles[i] = bundleEditor.parseBundle(allBundles[i]);
      }
      console.log(allBundles);
      changeHash('createGame')();
    });
  }

}
