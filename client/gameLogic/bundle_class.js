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
    this.langcode = data.langcode;
    this.author = data.author;
    this.title = data.title;
    this._setupRounds();
  }

  getRoundsArr() {
    return [this.round_1, this.round_2, this.round_3, this.final];
  }

  removeQuestion(string, roundNubmer) {
    const round = this.getRoundsArr()[roundNubmer];
    const index = round.indexOf(q => q.string === string);
    console.log(index);
    this.players.splice(index, 1);
  }
}
