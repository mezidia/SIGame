'use strict';

export default class Bundle {
  _setupRounds() {
    this.rounds = [];
    for (let round = 0; round < this.roundsNum; round++) {
      this.rounds.push(this.decks.slice(round * this.qInThemeNum, round * this.qInThemeNum + this.qInThemeNum))
    }
    this.final = this.decks.slice(this.roundsNum * this.qInThemeNum, this.roundsNum * this.qInThemeNum + this.qInFinal);
  }

  constructor(data) {
    this.decks = data.decks;
    this.langcode = data.langcode;
    this.author = data.author;
    this.title = data.title;
    this.roundsNum = data.roundsNum;
    this.themsInRoundNum = data.themsInRoundNum;
    this.qInThemeNum = data.qInThemeNum;
    this.qInFinal = data.qInFinal;
    this._setupRounds();
  }

  getRoundsArr() {
    return [this.rounds, this.final];
  }

  getRegularDecks() {
    return this.rounds;
  }

  getFinalDecks() {
    return this.final;
  }

}
