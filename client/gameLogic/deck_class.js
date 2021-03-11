'use strict';

export default class Deck {
  _setQuestionsCost() {
    this.questions.forEach((q, i) => {
      if (!q.cost) q.cost = ++i * 100;
    });
  }

  constructor(data) {
    this.subject = data.subject;
    this.questions = data.questions;
    this._setQuestionsCost();

  }

  shuffle() {
    this.questions(() => Math.random() - 0.5);
  }

}
