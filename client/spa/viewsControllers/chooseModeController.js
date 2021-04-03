'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js';
import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';
import { promisifySocketMSG } from '../../utils.js';

const bundleEditor = new BundleEditor();

export default class ChooseModeController {

  clickConfig = {
    'create-game-btn': [createGameLobby],
    'join-btn': [joinLobby],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    return this[configString][evt.target.id];
  }

  //join-btn click handle
  async joinLobby() {
    await changeHash('lobbySearch')();
    updateGames(storage.allGames);
  }

  createGameLobby() {
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


