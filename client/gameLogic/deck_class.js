'use strict';

export default class Deck {
  constructor(data) {
    this.subject = data.subject;
    this.questions = data.questions;
    this.author = data.author;

  }

  shuffle() {
    this.questions(() => Math.random() - 0.5);
  }

}
