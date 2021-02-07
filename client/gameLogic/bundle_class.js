'use strict';

export default class Bundle {
  _setupRounds() {
    this.round_1 = this.decks.slice(0, 5);
    this.round_2 = this.decks.slice(5, 10);
    this.round_3 = this.decks.slice(10, 15);
  }

  constructor(data) {
    this.decks = data.decks;
    this.language = data.decks[0].language;
    this._setupRounds();
  }


}
