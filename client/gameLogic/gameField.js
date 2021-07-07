'use strict';

import Language from '../changeLanguage.js';
import QReader from './question_reader.js'

export default class GameField {
  constructor() {
    if (!GameField._instance) {
      this.Qreader = new QReader('game-display');
      GameField._instance = this;
    }
    return GameField._instance;
  }

  // returns a game table used in classic mode
  drawTable(deck, isGm = false) {
    if (isGm) {
      try {
        document.getElementById('submitPoints-sums-btn').style.removeProperty('grid-area');
      } catch(e) {}
      try {
        document.getElementById('changePoints-sums-btn').style.removeProperty('grid-area');
      } catch(e) {}
    }
    document.getElementById('exit-btn').style.gridArea = '2 / 1 / 3 / 3'
    document.getElementById('pause-btn').style.display = 'block';

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
    gameDisplay.innerHTML = `<div class="col-3" style="padding: 0 0 0 0;">
      <div class="vertical-grid-5">
        <div class="centred-text" id="theme-1">${deck[0].subject}</div>
        <div class="centred-text" id="theme-2" style="border-top: 2px solid #010101">${deck[1].subject}</div>
        <div class="centred-text" id="theme-3" style="border-top: 2px solid #010101">${deck[2].subject}</div>
        <div class="centred-text" id="theme-4" style="border-top: 2px solid #010101">${deck[3].subject}</div>
        <div class="centred-text" id="theme-5" style="border-top: 2px solid #010101">${deck[4].subject}</div>
      </div>
    </div>
    <div class="col-9" style="padding: 0 0 0 0;">
      <div class="table-25">
        ${drawCells(deck)}
      </div>
    </div>
    `;
  }

  // displays list of themes for final round
  drawFinalRound(themes) {
    document.getElementById('game-display').innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: space-around;" id="final-display">
      ${themes.map((question, index) => {
        return `<h1 style="text-align: center" id="theme-${index}">${question.subject}</h1>`;
      }).join('\n')}
    </div>`;
  }

  // removes selected theme from the list
  removeFinalTheme(index) {
    const theme = document.getElementById(`theme-${index}`).textContent;
    document.getElementById('final-display').removeChild(document.getElementById(`theme-${index}`));
    return theme;
  }

  // return true if removed child was last, else false
  isNullThemes() {
    const finalDisplay = document.getElementById('final-display');
    return finalDisplay.childElementCount === 0 ? true : false;
  }

  // draws a question and reads it.
  // When the animation is over you can listen to it via
  // animationend listener. There's an example of it in main.js 141 line
  drawQuestion(question, callback, isGm = false, needToRead = true) {
    document.getElementById('pause-btn').style.display = 'none';
    if (isGm) {
      try {
        document.getElementById('changePoints-sums-btn').style.gridArea = '1 / 1 / 2 / 3';
      } catch(e) {}
      try {
        document.getElementById('submitPoints-sums-btn').style.gridArea = '1 / 1 / 2 / 3';
      } catch(e) {}
    } else {
      document.getElementById('exit-btn').style.gridArea = '1 / 1 / 3 / 3';
    }
    this.Qreader.draw(question, callback, needToRead);
  }

  congratulate(name) {
    setTimeout(this.exitBtn, 1000); // exit button appears after 1 second
    return this.Qreader.congratulate(name);
  }

  flash(text, delta = 400, total = 2800) { // tick every 0.4s for 2.8s
    this.Qreader.flash(text, delta, total);
    return total;
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
    document.getElementsByClassName('game-container')[0].style.gridTemplateRows = isGm ? '20px 1fr auto 0': '20px 1fr auto 50px';
    document.getElementById('changePoints-sums-btn').style.display = isGm ? 'block': 'none';
    document.getElementById('pause-btn').style.gridColumnStart = isGm ? '2': '1';
  }

  // draws popup to grade players' answers
  gmPopUp(who, ans, t, f) {
    Array.isArray(t) ? t = t.join(',') : false;
    Array.isArray(f) ? f = f.join(',') : false;
    document.getElementById('reply').innerHTML = `<div class="container gm-popup">
        <div id="answer-info" style="grid-row: 1 / 2; grid-column: 1 / 2">
          <span class="badge badge-primary" id="answr-author" style="font-size: 24px">${who}</span>
          <br>
          <span id="answer-text">${ans}</span>
        </div>
        <div class="row">
        
          <div class="col-sm-6" style="display: flex; flex-direction: column">
            <h2 data-localize="correct-answers">${Language.getTranslatedText('correct-answers')}</h2>
            <p id="correct-answer-text">${t.split(',').map(el => el + '<br>').join(' ')}</p>
            <div style="flex-grow: 1;"></div>
            <div id="correct" class="btn dark-b-hover game-button btn-50" style="width: 100%" data-localize="correct">${Language.getTranslatedText('correct')}</div>
          </div>
          
          <div class="col-sm-6" style="display: flex; flex-direction: column">
            <h2 data-localize="wrong-answers">${Language.getTranslatedText('wrong-answers')}</h2>
            <p id="wrong-answer-text">${f.split(',').map(el => el + '<br>').join(' ')}</p>
            <div style="flex-grow: 1;"></div>
            <div id="uncorrect" class="btn dark-r-hover game-button btn-50" style="width: 100%" data-localize="wrong">${Language.getTranslatedText('wrong')}</div>
          </div>
          
        </div>
      </div>
      `;
  }

 // draws popup to grade players' answers
 appealPopUp(who, ans, t, f) {
  Array.isArray(t) ? t = t.join(',') : false;
  Array.isArray(f) ? f = f.join(',') : false;
  document.getElementById('popupPlaceholder').innerHTML = `<div class="custom-popup">
    <p>${who} answered: ${ans}</p>
    <h2 class="text-primary" data-localize="correct-answers">${Language.getTranslatedText('correct-answers')}</h2>
    <p id="correct-answer-text">${t.split(',').map(el => el + '<br>').join(' ')}</p>
    <h2 class="text-primary" data-localize="wrong-answers">${Language.getTranslatedText('wrong-answers')}</h2>
    <p id="wrong-answer-text">${f.split(',').map(el => el + '<br>').join(' ')}</p>
    <button class="btn dark-b-hover" style="width: 50%; text-align: center; float: left" id="agreeWithApeal" data-localize="agree">${Language.getTranslatedText('agree')}</button>
    <button class="btn dark-r-hover" style="width: 50%; text-align: center;" id="disagreeWithApeal" data-localize="disagree">${Language.getTranslatedText('disagree')}</button>
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
    playerIcon.id = 'icon-' + name;
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
    const playerID = 'icon-' + name;
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
    console.log(document);
    const gameDisplay = document.getElementById('game-display');
    gameDisplay.innerHTML = `<img style="display: block; width: auto; height: auto; margin-left: auto; margin-right: auto;" src="lobbySearchImage.jpg" alt="Waiting for start">`;
  }

  drawStartButton() {
    const placeHolder = document.getElementById('reply');
    placeHolder.innerHTML = `<div style="display: flex; justify-content: center;">
      <button class="btn dark-b-hover" id="startGame-btn" data-localize="play">${Language.getTranslatedText('play')}</button>
    </div>`;
    document.getElementById('game-state-text').innerHTML = '';
  }

  drawPreStartText(number, minNumber) {
    document.getElementById('game-state-text').innerHTML =
      `${number.toString()}/${minNumber} <span data-localize="count-players-1">${Language.getTranslatedText('count-players-1')}
      </span><span data-localize="count-players-2">${Language.getTranslatedText('count-players-2')}</span>`
  }

  hideStartButton() {
    this.gmPopHide()
  }

  // makes button fullWidth
  buttonMode() {
    const inp = document.getElementById('input-answer');
    const but = document.getElementById('answer-btn');
    if (but) but.innerHTML = ``;
    inp.style.display = 'none';
    but.style.width = '100%';
  }

  disabledNode() {
    this.buttonMode();
    document.getElementById('answer-btn').disabled = true;
  }

  answerMode() {
    const input = document.getElementById('input-answer');
    const button = document.getElementById('answer-btn');
    if (button) button.innerHTML = '';
    input.style.display = 'block';
    button.style.width = '100px';
  }

  appealMode() {
    this.buttonMode()
    const button = document.getElementById('answer-btn');
    button.innerHTML = `I'm right!`;
  }

  bet() {
    document.getElementById('popupPlaceholder').innerHTML = `<div class="custom-popup">
     <h2 class="text-primary" data-localize="make-bet">${Language.getTranslatedText('make-bet')}</h2>
     <input id="betSize" style="width: 100%" required>
     <button id="bet-btn" class="btn dark-r-hover" style="width: 100%; text-align: center; float: left" id="place-bet">OK</button>
  </div>
  `;
  }

  hideBet() {
    document.getElementById('popupPlaceholder').innerHTML = '';
  }

  pause(timeStamp) {
    const overlay = document.getElementById('pause-overlay')
    overlay.style.width = overlay.style.width === '100%' ? '0' : '100%'
  }

  announceGameState(text) {
    document.getElementById('game-state-text').innerHTML = text;
  }

  displayAnswer(name, text, delay = 4000) {
    const parent = document.getElementById(`icon-${name}`);
    const answer = document.createElement('div');
    answer.id = 'answer-container';
    answer.innerHTML = text;
    const w = parent.offsetWidth;
    answer.style.width = `${w}px`;
    answer.style.left = `${parent.offsetLeft}px`;
    parent.append(answer);
    const h = parent.offsetTop - answer.offsetHeight;
    answer.style.top = `${h}px`;
    setTimeout(() => answer.remove(), delay);
  }

  highlightCurrentPlayer(name) {
    document.getElementById(`icon-${name}`).style.backgroundColor = '#0399E1';
  }

  
  exitBtn() {
    const placeHolder = document.getElementById('popupPlaceholder');
    placeHolder.innerHTML = `<div style="display: flex; justify-content: center;">
        <button class="home-bt btn dark-r-hover" data-localize="home" id="startGame-btn" style="top: 20vw">Home</button>
      </div>`;
  }
}
