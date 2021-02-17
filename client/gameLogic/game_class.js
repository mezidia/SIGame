'use strict';

import GameField from "../spa/views/gameField.js";
import User from "./user_class.js";

export default class Game {
  _setListeners() {
    document.addEventListener('click', this.clickHandler);
  }

  _removeListeners() {

  }

  constructor(bundle, settings) {
    this._id = undefined;
    this._socket = new User().socket;
    this.master = new User().name;
    this.roomName = settings.roomName;
    this.maxPpl = settings.ppl;
    this.password = settings.password;
    this.gameMode = settings.gameMode;
    this.bundle = bundle;
    this.players = {};
    this.gameField = new GameField();
    this._setListeners();
    console.log('new Game');
  }

  clickHandler = (e) => {
    const target = e.target;
    if (!target.classList.contains('q-cell')) return;
    const splitedID = target.id.split('-');
    const i = splitedID[1] - 1;
    const j = splitedID[2] - 1;
    const q = this.bundle.decks[i].questions[j];
    console.log(q);
    this.gameField.drawQuestion(q.string);
  }

  init() {
    this.gameField.drawTable(this.bundle.round_1);
  }

  setupQuestiones() {

  }

  broadcast(event) {
    this._socket.send(JSON.stringify({ mType: 'broadcastInRoom', data: {
      event: event,
      roomID: this._id,
    }})); 
  }

  addPlayer(name) {
    this.players.name = name;
  }

  kikcPlayer() {

  }

  pause() {
   
  }

  gameLoop() {

  }

  setMaster(master) {
    this.master = master;
  }

  setID(id) {
    if (id) this._id = id;
  }
}
