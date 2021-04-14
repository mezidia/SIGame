'use strict';

import Language from '../../changeLanguage.js';

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
      for(let i = 1; i <= deck.length; ++i) {
        for(let j = 1; j <= deck[i - 1].questions.length; ++j) {
          if (deck[i-1].questions[j-1]) {
            let questionCost = deck[i - 1].questions[j - 1].cost;
            if (!questionCost) questionCost = '';
            res.push(`<div class="centred-text q-cell" id="cell-${i}-${j}" style="grid-column: ${j} / ${j + 1}; grid-row: ${i} / ${i + 1}">${questionCost}</div>`)
          }
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

  scoreAsInput = (toChange = true) => () => {
    const divs = document.getElementsByClassName('player-display');
    const btn = document.getElementById(`${toChange ? 'changePoints' : 'submitPoints'}-sums-btn`);
    if (toChange) {
      btn.innerHTML = Language.getTranslatedText('apply');
      btn.id = 'submitPoints-sums-btn';
    } else {
      btn.innerHTML = Language.getTranslatedText('change-sums');
      btn.id = 'changePoints-sums-btn';
    }
    for (const div of divs) {
      const child = div.children[1];
      div.removeChild(child);
      const inp = document.createElement(`${toChange? 'input': 'p'}`);
      inp.id = child.id;
      if (toChange) {
        inp.value = child.innerHTML;
        inp.placeholder = child.innerHTML;
      } else {
        inp.innerHTML = !isNaN(child.value) ? child.value : child.placeholder;
      }
      div.append(inp);
    }
    toChange = !toChange;
  }

  collectScores() {
    const divs = document.getElementsByClassName('player-display');
    const res = {};
    for(const div of divs) {
      const name = div.children[0].innerHTML;
      res[name] = +div.children[1].innerHTML
    }
    return res;
  }

  // switches layout between player and game master mode
  // if isGm is true, switches to GM mode
  switchGameMode(isGm) {
    document.getElementById('reply').innerHTML = isGm ? '' : `<input id="input-answer" type="text" style="display: block; width: calc(100% - 100px); height: 100%; float: left">
      <button id="btn-answer" class="btn btn-primary game-button" style="width: 100px; height: 100%"></button>`;
    document.getElementsByClassName('game-container')[0].style.gridTemplateRows = isGm ? '1fr auto 0': '1fr auto 50px';
    document.getElementById('changePoints-sums-btn').style.display = isGm ? 'block': 'none';
    document.getElementById('report-btn').style.gridColumnStart = isGm ? '2': '1';
  }

  // draws popup to grade players' answers
  gmPopUp(who, ans, t, f) {
    document.getElementById('reply').innerHTML = `<div class="container gm-popup">
        <div id="answer-info" style="grid-row: 1 / 2; grid-column: 1 / 2">
          <span class="badge badge-primary" id="answer-author">${who}</span>
          <br>
          <span id="answer-text">${ans}</span>
        </div>
        <div class="row">
        
          <div class="col-sm-6">
            <h2 class="text-primary" data-localize="correct-answers">${Language.getTranslatedText('correct-answers')}</h2>
            <p id="correct-answer-text">${t.split(',').map(el => el + '<br>').join(' ')}</p>
            <div id="correct" class="btn btn-primary game-button btn-50" style="width: 100px" data-localize="correct">${Language.getTranslatedText('correct')}</div>
          </div>
          
          <div class="col-sm-6">
            <h2 class="text-primary" data-localize="wrong-answers">${Language.getTranslatedText('wrong-answers')}</h2>
            <p id="wrong-answer-text">${f.split(',').map(el => el + '<br>').join(' ')}</p>
            <div id="uncorrect" class="btn btn-primary game-button btn-50" style="width: 100px" data-localize="wrong">${Language.getTranslatedText('wrong')}</div>
          </div>
          
        </div>
      </div>
      `;
  }

 // draws popup to grade players' answers
 appealPopUp(who, ans, t, f) {
   document.getElementById('popupPlaceholder').innerHTML = `<div class="custom-popup">
     <p>${who} answered: ${ans}</p>
     <h2 class="text-primary" data-localize="correct-answers">${Language.getTranslatedText('correct-answers')}</h2>
     <p id="correct-answer-text">${t.split(',').map(el => el + '<br>').join(' ')}</p>
     <h2 class="text-primary" data-localize="wrong-answers">${Language.getTranslatedText('wrong-answers')}</h2>
     <p id="wrong-answer-text">${f.split(',').map(el => el + '<br>').join(' ')}</p>
     <button class="btn btn-primary" style="width: 50%; text-align: center; float: left" id="agreeWithApeal" data-localize="agree">${Language.getTranslatedText('agree')}</button>
     <button class="btn btn-primary" style="width: 50%; text-align: center;" id="disagreeWithApeal" data-localize="disagree">${Language.getTranslatedText('disagree')}</button>
  </div>
  `;
}

  // hides a popup
  appealPopHide() {
    document.getElementById('popupPlaceholder').innerHTML = '';
  }

  // hides a popup
  gmPopHide() {
    document.getElementById('reply').innerHTML = '';
  }

  // display the new player joined the game
  addPlayer(name, score = 0) {
    const playerIcon = document.createElement('div');
    playerIcon.id = name + '-icon';
    playerIcon.className = 'player-display'
    playerIcon.innerHTML = `<p>${name}</p>
      <p id="${name}-score">${score}</p>`
    document.getElementById('players-icons').append(playerIcon);
  }

  // remove the player from players bar
  removePlayer(name) {
    const container = document.getElementById('players-icons');
    if (!container.hasChildNodes()) return 'this room is empty';
    const childs = container.childNodes;
    const playerID = name + '-icon';
    for (const child of childs) {
      if (child.id === playerID) {
        child.remove();
        break;
      }
    }
  }
    
  updatePlayers(palyers, points) {
    const container = document.getElementById('players-icons');
    container.innerHTML = '';
    for (const name of palyers) {
      this.addPlayer(name, points[name]);
    }
  }

  updatePoints(points) {
    const container = document.getElementById('players-icons');
    if (!container.hasChildNodes()) return 'this room is empty';
    const childs = container.childNodes;
    for (const child of childs) {
      const name = child.id.split('-')[0];
      child.innerHTML = `<p>${name}</p>
      <p id="${name}-score">${points[name]}</p>`;
    }
  }

  waitForPlayersJpgShow() {
    const gameDisplay = document.getElementById('game-display');
    gameDisplay.innerHTML = `<img style="display: block; width: 50%; height: auto; margin-left: auto; margin-right: auto;" src="lobbySearchImage.jpg" alt="Waiting for start">`;
  }

  drawStartButton() {
    const placeHolder = document.getElementById('reply');
    placeHolder.innerHTML = `<div style="display: flex; justify-content: center;">
        <button class="btn btn-primary" id="startGame-btn" data-localize="play">${Language.getTranslatedText('play')}</button>
      </div>`
  }

  hideStartButton() {
    const placeHolder = document.getElementById('reply');
    placeHolder.innerHTML = ``
  }

  // makes button fullWidth
  buttonMode() {
    const inp = document.getElementById('input-answer');
    const but = document.getElementById('btn-answer');
    but.innerHTML = ``;
    inp.style.display = 'none';
    but.style.width = '100%';
  }

  answerMode() {
    const input = document.getElementById('input-answer');
    const button = document.getElementById('btn-answer');
    button.innerHTML = '';
    input.style.display = 'block';
    button.style.width = '100px';
  }

  appealMode() {
    this.buttonMode()
    const button = document.getElementById('btn-answer');
    button.innerHTML = `I'm right!`;
  }

  bet() {
    document.getElementById('popupPlaceholder').innerHTML = `<div class="custom-popup">
     <h2 class="text-primary">Please make a bet</h2>
     <input id="bet-size" style="width: 100%" required>
     <button class="btn btn-primary" style="width: 100%; text-align: center; float: left" id="place-bet">OK</button>
  </div>
  `;
  }

  pause() {
    const overlay = document.getElementById('pause-overlay')
    overlay.style.width = overlay.style.width === '100%' ? '0' : '100%'
  }

}
