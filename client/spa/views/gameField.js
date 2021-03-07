'use strict';

export default class GameField {
  constructor() {
    if (!GameField._instance) {
      GameField._instance = this;
    }
    return GameField._instance;
  }

  // returns a game table used in classic mode
  drawTable(deck) {
    const gameDisplay = document.getElementById('game-display');
    const drawCells = (deck) => {
      console.log(deck[0]);
      const res = [];
      for(let i = 1; i <= 5; ++i) {
        for(let j = 1; j <= 5; ++j) {
          let questionCost = deck[i - 1].questions[j - 1].cost;
          if (!questionCost) questionCost = '';
          res.push(`<div class="centred-text q-cell" id="cell-${i}-${j}">${questionCost}</div>`)
        }
      }
      return res.join('\n');
    }
    gameDisplay.innerHTML = `<div class="col-3" style="background-color: #c7280e; padding: 0 0 0 0;">
      <div class="vertical-grid-5">
        <div class="centred-text" id="theme-1">${deck[0].subject}</div>
        <div class="centred-text" id="theme-2">${deck[1].subject}</div>
        <div class="centred-text" id="theme-3">${deck[2].subject}</div>
        <div class="centred-text" id="theme-4">${deck[3].subject}</div>
        <div class="centred-text" id="theme-5">${deck[4].subject}</div>
      </div>
    </div>
    <div class="col-9" style="background-color: #f36a54; padding: 0 0 0 0;">
      <div class="table-25">
        ${drawCells(deck)}
      </div>
    </div>
    `;
  }

  // draws a question and reads it.
  // When the animation is over you can listen to it via
  // animationend listener. There's an example of it in main.js 141 line
  drawQuestion(str) {
    const gameDisplay = document.getElementById('game-display');
    // noinspection CssInvalidPropertyValue
    gameDisplay.innerHTML = `<span id="question-text">${[...str].map((letter, index) =>
      `<span ${(index === str.length - 1) ? 'id="last-letter"': ''}
          class="question-letter" style="animation-duration: ${index * 0.16}s">${letter}</span>`).join('')}
    </span>`
  }

  // switches layout between player and game master mode
  // if isGm is true, switches to GM mode
  switchGameMode(isGm) {
    document.getElementById('reply').innerHTML = isGm ? '' : `<input id="input-answer" type="text" style="display: block; width: calc(100% - 100px); height: 100%; float: left">
      <button id="btn-answer" class="btn btn-primary game-button" style="width: 100px; height: 100%"></button>`;
    document.getElementsByClassName('game-container')[0].style.gridTemplateRows = isGm ? '1fr auto 0': '1fr auto 50px';
    document.getElementById('change-sums-btn').style.display = isGm ? 'block': 'none';
    document.getElementById('report-btn').style.gridColumnStart = isGm ? '2': '1';
  }

  // draws popup to grade players' answers
  gmPopUp(/*args*/) {
    document.getElementById('reply').innerHTML = `<div class="container gm-popup">
        <div id="answer-info" style="grid-row: 1 / 2; grid-column: 1 / 2">
          <span class="badge badge-primary" id="answer-author">дова<!-- author from args --></span>
          <br>
          <span id="answer-text">ываыва <!-- answer text from args --> </span>
        </div>
        <div class="row">
        
          <div class="col-sm-6">
            <h2 class="text-primary">Correct answers</h2>
            <p id="correct-answer-text"> ывафвыафыва<!-- correct answers from args --> </p>
            <div class="btn btn-primary game-button btn-50" style="width: 100px">Correct</div>
          </div>
          
          <div class="col-sm-6">
            <h2 class="text-primary">Wrong answers</h2>
            <p id="wrong-answer-text"> фывафывавывывы<!-- correct answers from args --> </p>
            <div class="btn btn-primary game-button btn-50" style="width: 100px">Wrong</div>
          </div>
          
        </div>
      </div>
      `;
  }

  // hides a popup
  gmPopHide() {
    document.getElementById('reply').innerHTML = '';
  }

  // display the new player joined the game
  addPlayer(data) {
    const playerIcon = document.createElement('div');
    playerIcon.id = data.id;
    playerIcon.className = 'player-display'
    playerIcon.innerHTML = `<p>${data.name}</p>
      <p id="${data.id}-score">0</p>`
    document.getElementById('players-icons').append(playerIcon);
  }

}
