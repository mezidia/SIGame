'use strict';

import { storage } from '../../main.js';

export default class RedactorController {

  static createGame = () => {
    const data = {};
  
    const roomName = document.getElementById('roomName').value;
    const password = document.getElementById('roomPassword').value;
    const questionBundle = document.getElementById('questionBundle');
    const gameMode = document.getElementById('gameMode').value;
    const totalPlayers = document.getElementById('totalPlayers').value;
    if (!reg.test(roomName)) return;
    data.settings = {
      roomName,
      password,
      gameMode,
      totalPlayers,
      master: new User().name,
      hasPassword: password ? true : false,
    };
    console.log(questionBundle.value);
    if (questionBundle.value === 'download') {
      const bundleFileImport = document.getElementById('bundle-file');
      const file = bundleFileImport.files[0];
      if (!file) return;
      const f = new FileReader();
      f.onload = (e) => {
        const bundleObj = JSON.parse(e.target.result);
        data.bundle = bundleEditor.parseBundle(bundleObj);
        game = gameMode === 'Classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
        const msg = {
          'mType': 'newGameLobby',
          data,
        };
        promisifySocketMSG(msg, 'newLobbyId', storage.socket).then(async (msg) => {
          roomId = msg.data.id;
          await changeHash(`simpleLobby/roomID=${roomId}`)();
          game.init();
          game.setID(msg.data.id);
        });
      }
      f.readAsText(file);
    } else if (questionBundle.value === 'findByName') {
      const bundleTitle = document.getElementById('bundleSearch-input').value;
      for (const bundle of storage.allBundles) {
        if (bundle.title === bundleTitle) {
          data.bundle = bundle;
          break;
        }
      }
      game = gameMode === 'Classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
      const msg = {
        'mType': 'newGameLobby',
        data,
      };
      promisifySocketMSG(msg, 'newLobbyId', storage.socket).then(async (msg) => {
        roomId = msg.data.id;
        await changeHash(`simpleLobby/roomID=${roomId}`)();
        game.init();
        game.setID(msg.data.id);
      });
    } else {
      data.bundle = bundleEditor.getRandomBundleFrom(storage.allBundles, language.json.code);
      game = gameMode === 'Classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
      const msg = {
        'mType': 'newGameLobby',
        data,
      };
      promisifySocketMSG(msg, 'newLobbyId', storage.socket).then(async (msg) => {
        roomId = msg.data.id;
        await changeHash(`simpleLobby/roomID=${roomId}`)();
        game.setID(msg.data.id);
        game.init();
        console.log(game);
      });
    }
  
  };
}