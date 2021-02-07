'use strict';

export default class Game {
  _setupEventListeners() {
    document.addEventListener('click', () => {

    });
  }
  constructor(bundle, settings) {
    this.master = settings.socket;
    this.bundle = bundle;
    this.players = [];
    this._setupEventListeners();
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
