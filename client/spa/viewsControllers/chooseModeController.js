'use strict';

import { storage } from '../../main.js';
import { updateGames } from './externalControlersFunctions.js';
import { changeHash } from '../spaControl.js';
import { promisifySocketMSG } from '../../utils.js';
import { loader } from '../../utils/loader.js';

export default class ChooseModeController {

  clickConfig = {
    'create-game-btn': [this.createGameLobby],
    'join-btn': [this.joinLobby],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
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
      'mType': 'getBundleNames',
    };
    promisifySocketMSG(msg, 'bundleNames', storage.socket).then(msg => {
      for (const i in msg.data) {
        storage.bundlesMeta[i] = msg.data[i];
      }
      changeHash('createGame')();
    });
  }

}
