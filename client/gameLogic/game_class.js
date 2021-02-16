'use strict';

import GameField from "../spa/views/gameField.js";

export default class Game {
  _setupEventListeners() {
    document.addEventListener('click', () => {

    });
  }

  constructor(bundle, settings) {
    this._id = undefined;
    this.master = settings.socket;
    this.bundle = bundle;
    this.players = [];
    this.gameField = new GameField();
    this._setupEventListeners();
    console.log('new Game');
  }

  init() {
    this.gameField.drawTable();
  }

  addPlayer() {

  }

  kikcPlayer() {

  }

  pause() {
   
  }

  gameLoop() {

  }

  setID(id) {
    if (id) this._id = id;
  }
}
