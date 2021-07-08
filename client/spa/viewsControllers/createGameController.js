'use strict';

import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';
import { loader } from '../../utils/loader.js';
import { promisifySocketMSG } from '../../utils.js';
import BundleEditor from '../../gameLogic/bundleEditor_class.js';
import Language from '../../changeLanguage.js';
import User from '../../gameLogic/user_class.js';
import Game from '../../gameLogic/game_class.js';
import SimpleGame from '../../gameLogic/simpleGame_class.js';

const reg = /^[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+$/;
const bundleEditor = new BundleEditor();

export default class CreateGameController {

  clickConfig = {
    'startGame': [this.createGame],

  }

  changeConfig = {
    'questionBundle': [this.onBundleCheckChange],
    'type-of-password': [this.onTypeOfPasswordChange],

  }

  inputConfig = {
    'bundleSearch-input': [this.onBundleSearchInput],
    'totalPlayers': [this.onTotalPlayersInput],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
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

  onBundleSearchInput() {
    const bundleSearchAutocomp = document.getElementById('bundleSearch-input-autocomplete');
    const hide = () => {
      document.removeEventListener('click', hide);
      bundleSearchAutocomp.style.display = 'none';
    }
    if (bundleSearchAutocomp.innerHTML === "") {
      document.addEventListener('click', hide);
    }
    bundleSearchAutocomp.innerHTML = "";
    const input = document.getElementById('bundleSearch-input').value;
    const bundles = storage.bundlesMeta.map(el => el.bundle_title);
    for (let i in bundles) {
      const comp = bundles[i].substring(0, input.length);
      if (comp.toLowerCase() === input.toLowerCase()) {
        const autocomp = document.createElement('div');
        autocomp.innerHTML = bundles[i];
        autocomp.setAttribute('class', 'bundle-search-input-autocomplete');
        bundleSearchAutocomp.appendChild(autocomp);
        autocomp.addEventListener('click', () => {
          document.getElementById('bundleSearch-input').value = autocomp.innerText;
          hide();
        })
      }
    }
    bundleSearchAutocomp.style.display = 'block';
    let i = -1;
    document.getElementById('bundleSearch-input').addEventListener('keydown', evt => {
      if (evt.code === 'ArrowDown') {
        i++;
        if (i >= bundleSearchAutocomp.children.length) i = 0;
        bundleSearchAutocomp.children[i].style.backgroundColor = '#d4d4d4';
        for (let j = 0; j < bundleSearchAutocomp.children.length; j++) {
          if (i !== j) {
            bundleSearchAutocomp.children[j].style.backgroundColor = 'white';
          }
        }
      } else if (evt.code === 'ArrowUp') {
        i--;
        if (i < 0) i = bundleSearchAutocomp.children.length - 1;
        bundleSearchAutocomp.children[i].style.backgroundColor = '#d4d4d4';
        for (let j = 0; j < bundleSearchAutocomp.children.length; j++) {
          if (i !== j) {
            bundleSearchAutocomp.children[j].style.backgroundColor = 'white';
          }
        }
      } else if (evt.code === 'Enter') {
        evt.preventDefault();
        bundleSearchAutocomp.children[i].click();
      }
    });
  }

  onTotalPlayersInput() {
    const number = document.getElementById('totalPlayers').value;
    document.getElementById('totalPlayers-number').innerText = number;
  }

  createGame() {
    const data = {};

    const roomName = document.getElementById('roomName').value;
    const password = document.getElementById('roomPassword').value;
    const questionBundle = document.getElementById('questionBundle');
    const gameModeSelect = document.getElementById('gameMode');
    const totalPlayers = 12; // max amount of players
    if (!reg.test(roomName)) return;
    
    const gameMode = gameModeSelect.options[gameModeSelect.selectedIndex]
      .attributes['data-localize'].textContent
      .split('-')[0];

    data.settings = {
      roomName,
      password,
      gameMode,
      totalPlayers,
      master: new User().name,
      hasPassword: password ? true : false,
    };
    if (questionBundle.value === 'download') {
      const bundleFileImport = document.getElementById('bundle-file');
      const file = bundleFileImport.files[0];
      loader();
      if (!file) return;
      const f = new FileReader();
      f.onload = (e) => {
        const bundleObj = JSON.parse(e.target.result);
        data.bundle = bundleEditor.parseBundle(bundleObj);
        storage.game = gameMode === 'classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
        const msg = {
          'mType': 'newGameLobby',
          data,
        };
        promisifySocketMSG(msg, 'newLobbyId', storage.socket).then(async (msg) => {
          storage.roomId = msg.data.id;
          await changeHash(`simpleLobby/roomID=${storage.roomId}`)();
          storage.game.init();
          storage.game.setID(msg.data.id);
        });
      }
      f.readAsText(file);
    } else if (questionBundle.value === 'findByName') {
      const bundleTitle = document.getElementById('bundleSearch-input').value;
      const message = {mType: 'getBundleByName', data: {name: bundleTitle}};
      loader();
      promisifySocketMSG(message, 'bundleRows', storage.socket).then(async (info) => {
        data.bundle = bundleEditor.parseBundle(info.data); //todo
        storage.game = gameMode === 'classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
        const msg = {
          'mType': 'newGameLobby',
          data,
        };
        promisifySocketMSG(msg, 'newLobbyId', storage.socket).then(async (msg) => {
          storage.roomId = msg.data.id;
          await changeHash(`simpleLobby/roomID=${storage.roomId}`)();
          storage.game.init();
          storage.game.setID(msg.data.id);
        });
      });
    } else {
      const currentLangcode = Language.getLangcode();
      const bByName = storage.bundlesMeta.filter(el => el.langcode_name === currentLangcode);
      const bundleTitle = bByName.map(el => el.bundle_title).sort(() => Math.random() - 0.5)[0];
      const message = {mType: 'getBundleByName', data: {name: bundleTitle}};
      loader();
      promisifySocketMSG(message, 'bundleRows', storage.socket).then(async (info) => {
        data.bundle = bundleEditor.parseBundle(info.data);
        storage.game = gameMode === 'classic' ? new Game(data.bundle, data.settings) : new SimpleGame(data.bundle, data.settings);
        const msg = {
          'mType': 'newGameLobby',
          data,
        };
        promisifySocketMSG(msg, 'newLobbyId', storage.socket).then(async (msg) => {
          storage.roomId = msg.data.id;
          await changeHash(`simpleLobby/roomID=${storage.roomId}`)();
          storage.game.init();
          storage.game.setID(msg.data.id);
        });
      });
    }

  };

}