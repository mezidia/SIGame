'use strict';

export default class GameField {
  constructor() {
    if (!GameField._instance) {
      GameField._instance = this;
    }
    return GameField._instance;
  }
  // returns a game table used in classic mode
  drawTable() {
    const drawCells = () => {
      const res = [];
      for(let i = 1; i<=5; ++i) {
        for(let j = 1; j<=5; ++j) {
          res.push(`<div class="centred-text" id="cell-${i}-${j}"></div>`)
        }
      }
      return res.join('\n');
    }
    return `<div class="col-3" style="background-color: #c7280e; padding: 0 0 0 0;">
      <div class="vertical-grid-5">
        <div class="centred-text" id="theme-1"></div>
        <div class="centred-text" id="theme-2"></div>
        <div class="centred-text" id="theme-3"></div>
        <div class="centred-text" id="theme-4"></div>
        <div class="centred-text" id="theme-5"></div>
      </div>
    </div>
    <div class="col-9" style="background-color: #f36a54; padding: 0 0 0 0;">
      <div class="table-25">
        ${drawCells()}
      </div>
    </div>
    `;
  }
  // draws a question and reads it.
  // When the animation is over you can listen to it via
  // animationend listener. There's an example of it in main.js 141 line
  drawQuestion(str) {
    // noinspection CssInvalidPropertyValue
    return `<span id="question-text">${[...str].map((letter, index) =>
      `<span ${(index === str.length - 1) ? 'id="last-letter"': ''}
          class="question-letter" style="animation-duration: ${index * 0.16}s">${letter}</span>`).join('')}
    </span>`
  }

}
