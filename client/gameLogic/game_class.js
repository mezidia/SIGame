'use strict';

import GameField from "../spa/views/gameField.js";

export default class Game {
  _setupEventListeners() {
    document.addEventListener('click', () => {

    });
  }

  constructor(bundle, settings) {
    this.master = settings.socket;
    this.bundle = bundle;
    this.players = [];
    this.gameField = new GameField();
    this._setupEventListeners();
    console.log('new Game');
    //this.gameField.drawQuestion('улюлю');
  }

  addPlayer() {

  }

  kikcPlayer() {

  }

  pause() {

  }

  gameLoop() {

  }

}
