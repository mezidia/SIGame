'use strict';

export default class Game {
  _getDecksSubject() {
    const res = [];
    for (deck of this.decks) {
      res.push(deck.subject);
    }
    return res;
  }

  constructor(data) {
    this.gameMode = data.gameMode;             // режим гри
    this.decks = data.decks;                  // колоди
    this.subjects = this._getDecksSubject(); // масив всіх тем колод
  }

  addDeck(deck) {
    if (this.subjects.includes(deck.subject)) return;
    this.decks.push(deck)
    this.subjects = this._getDecksSubject();
  }

  removeDeck(deck) {
    const deckIndex = deck.findIndex(item => item.subject === deck.subject);
    this.decks.splice(deckIndex, 1);
  }

}
