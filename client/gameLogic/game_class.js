'use strict';

import GameField from "../spa/views/gameField.js";

export default class Game {
  _setupEventListeners() {
    document.addEventListener('click', () => {

    });
  }

  constructor(bundle, settings, socket) {
    this._id = undefined;
    this._socket = socket;
    this.master = settings.socket;
    this.bundle = bundle;
    this.players = [];
    this.gameField = new GameField();
    this._setupEventListeners();
    console.log('new Game');
  }

  init() {
    this.gameField.drawTable();
    this.gameField.drawQuestion('я працюю нормально');
    this.broadcast();
  }

  broadcast() {
    this._socket.send(JSON.stringify({ mType: 'broadcastInRoom', data: {
      event: {
      eventType: 'ur Turn',
      round: 3,
    },
    roomID: roomId,
  }}));
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
