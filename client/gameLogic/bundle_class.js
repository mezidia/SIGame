'use strict';

export default class Bundle {
  _setupRounds() {
    this.round_1 = this.decks.slice(0, 5);
    this.round_2 = this.decks.slice(5, 10);
    this.round_3 = this.decks.slice(10, 15);
    this.final = this.decks.slice(15, 22);
  }

  constructor(data) {
    this.decks = data.decks;
    this.language = data.language;
    this.author = data.author;
    this.title = data.title;
    this._setupRounds();
  }


}
