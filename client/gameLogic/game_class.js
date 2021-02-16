'use strict';

import GameField from "../spa/views/gameField.js";

export default class Game {

  constructor(bundle, settings, socket) {
    this._id = undefined;
    this._socket = socket;
    this.master = settings.socket;
    this.bundle = bundle;
    this.players = [];
    this.gameField = new GameField();
    console.log('new Game');
  }

  init() {
    this.gameField.drawTable();
  }

  broadcast() {

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
