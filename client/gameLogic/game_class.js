'use strict';

import GameField from "./gameField.js";
import User from "./user_class.js";
import Bundle from "./bundle_class.js";
import GameTimer from "./gameTimer_class.js";
import Timer from './timer_class.js';
import { changeHash } from "../spa/spaControl.js";
import Language from "../changeLanguage.js";

const ANSWERTIME = 10; //sec
const GAMETIME = 500; //sec
const APPEALTIME = 5; //sec
const MIN_PLAYERS = 3; // minimum amount of players 

export default class Game {
  _setListeners() {
    document.addEventListener('click', this.clickHandler);
    this._socket.addEventListener('message', this.socketHandler);
  }

  _removeListeners() {
    document.removeEventListener('click', this.clickHandler);
    this._socket.removeEventListener('message', this.socketHandler);
  }

  _prepForExit() {
    this._removeListeners();
    this.turnTimer.reset();
    this.gameTimer.reset();
    if (this.turnTimerID) this.turnTimerID.pause();
    if (this.appealTimerID) this.appealTimerID.pause();
  }

  constructor(bundle, settings, players) {
    this._id = undefined;
    this._socket = new User().socket;
    this.gameStatus = 0;           // [0, 1, 2] - [not started, started, paused]
    this.master = settings.master;
    this.roomName = settings.roomName;
    this.maxPpl = settings.ppl;
    this.password = settings.password;
    this.gameMode = settings.gameMode;
    this.bundle = new Bundle(bundle);
    this.players = players ? players : [settings.master];
    this.points = {[settings.master]: 0};
    this.gameField = new GameField();
    this.turnTimer = new GameTimer(this.turnTimerCallback);
    this.gameTimer = new GameTimer(this.globalTimerCallback);
    this._setListeners();
    this.rounds = this.bundle.getRoundsArr();
    this.currentQuestion = undefined;
    this.currentRound = 0;
    this.answerCounter = 0;
    this.turnTimerID = null;
    this.appealTimerID = null;
    this.lastAnswer = undefined;
    this.canMove = [];
    this.aleadyMoved = [];
    this.appealDecision = [];
    this.bets = {};
    this.playersIterator = undefined;
    console.log('new Game', this);
    globalThis.gf = new GameField();
  }

  turnTimerCallback(timeleft, totalTime) {
    const percent = Math.floor(timeleft/totalTime*100)
    const bar = document.getElementById('answer-timer').children[1];
    bar.style.width = `${percent}%`;
  }

  globalTimerCallback(timeleft, totalTime) {
    const percent = Math.floor(timeleft/totalTime*100)
    const bar = document.getElementById('game-global-timer').children[0];
    bar.style.width = `${percent}%`;
  }

  drawStartOrWait() {
    if (this.players.length >= MIN_PLAYERS) {
      this.gameField.drawStartButton();
    } else {
      this.gameField.drawPreStartText(this.players.length, MIN_PLAYERS)
    }
  }

  onLeaveGame = evt => {
    console.log(evt.name + ' left');
    const index = this.players.indexOf(evt.name);
    this.players.splice(index, 1);
    this.gameField.removePlayer(evt.name);
    delete this.points[evt.name];
    if (evt.name === this.master) {
      this.master = this.players[0];
    }
    if (this.master === new User().name) {
      this.gameField.switchGameMode(true);
      this.clickConfig.cell = null;
      if (this.gameStatus === 0) {
        this.drawStartOrWait();
      }
    }
  }

  onTurnOrder = evt => {
    if (this.master === new User().name) return console.log('i am game master' + this.master);
    if (evt.who.includes(new User().name)) {
      document.getElementById('answer-btn').disabled = false;
    } else {
      document.getElementById('answer-btn').disabled = true;
    }
  }

  onJoinGame = evt => {
    console.log(`${evt.name} joined:`, this.players);
    this.players.push(evt.name);
    this.points[evt.name] = 0;
    this.gameField.addPlayer(evt.name);
    if (new User().name === this.master) {
      this.drawStartOrWait();
      this.updatePoints();
    }
  }

  onPoints = evt => {
    this.points = evt.points;
    console.log(evt.points);
    this.gameField.updatePlayers(this.players, this.points);
  }

  onSetGM = evt => {
    this.master = evt.name;
  }

  onRegularQ = (evt, str) => {
    let timeToPause = 0;
    if (str !== 'Regular question') {
      timeToPause = this.gameField.flash(str);
    }
    setTimeout(() => {
    this.gameField.drawQuestion(evt.question.string, () => {
      if (new User().name === this.master) this.canRaiseHand(this.players);
    });
    }, timeToPause);
  }

  onSecretQ = (evt, str) => {
    console.log(evt.who);
    const timeToPause = this.gameField.flash(str);
    setTimeout(() => {
      this.gameField.announceGameState(evt.who + Language.getTranslatedText("choose-person-to-answer"));
      if (new User().name === evt.who) this.clickConfig.icon = this.onIconClick;
    }, timeToPause);
  }

  onBetQ = (evt, str) => {
    const timeToPause = this.gameField.flash(str);
    setTimeout(() => {
      if (new User().name !== this.master) this.gameField.bet();
    }, timeToPause);
  }

  onFinalQ = (evt, str) => {
    const timeToPause = this.gameField.flash(str);
    setTimeout(() => {
    if (new User().name !== this.master) this.gameField.bet();
    }, timeToPause);
  }

  qTypeConfig = {
    'regular': this.onRegularQ,
    'secret': this.onSecretQ,
    'bet': this.onBetQ,
    'final': this.onFinalQ,
    'sponsored': this.onRegularQ,
  }

  qTypeAnnounce = {
    'regular': 'Regular question',
    'secret': 'Question with secret',
    'bet': 'Question with bet',
    'final': 'Final question',
    'sponsored': 'Sponsored question',
  }

  onShowQuestion = evt => {
    this.currentQuestion = evt.question;
    const qHandler = this.qTypeConfig[this.currentQuestion.type];//this.qTypeConfig[this.currentQuestion.type];
    if (!qHandler) return console.log('Unknown q type');
    qHandler(evt, this.qTypeAnnounce[this.currentQuestion.type]);
  }

  onNextTurn = evt => {
    this.appealDecision = [];
    this.bets = {};
    if (new User().name !== this.master) this.gameField.buttonMode();
    this.clickConfig.answer = this.raiseHand;
    const decks = this.rounds[this.currentRound];
    for (const dIndex in decks) {
      for (const qIndex in decks[dIndex].questions) {
        if (!decks[dIndex].questions[qIndex]) continue;
        if (decks[dIndex].questions[qIndex].string === this.currentQuestion.string) {
          console.log(decks[dIndex].questions[qIndex].string, this.currentQuestion.string);
          decks[dIndex].questions[qIndex] = null;
          break;
        }
      }
    }
    this.checkAnswerCounter();
    if (this.currentRound === 3) { // switch to 3 for production
      this.gameField.drawFinalRound(this.bundle.getFinalDecks());
    } else {
      this.gameField.drawTable(this.rounds[this.currentRound]);
    }
  }

  onAnswerCheck = evt => {
    this.gameField.announceGameState(Language.getTranslatedText("gamemaster-checks-answers"));
    const t = this.currentQuestion.trueAns;
    const f = this.currentQuestion.falseAns;
    this.lastAnswer = { 
      who: evt.who,
      ans: evt.answer,
      t,
      f,
    };
    this.gameField.displayAnswer(evt.who, evt.answer);
    if (this.master !== new User().name) return;
    console.log(this.currentQuestion);
    this.gameField.gmPopUp(evt.who, evt.answer, t, f);
  }

  onCanAppeal = evt => {
    this.gameField.announceGameState(Language.getTranslatedText("appeal"));
    if (evt.who !== new User().name) return;
    this.gameField.appealMode();
    document.getElementById('answer-btn').disabled = false;
    this.clickConfig.answer = this.appeal;
    this.appealTimerID = new Timer(() => {
      document.getElementById('answer-btn').disabled = true;
      this.nextTurn();
    }, APPEALTIME * 1000);
  }

  onAppealDecision = evt => {
    this.appealDecision.push({
      who: evt.who,
      decision: evt.decision,
    });
    if ((this.players.length - 2) === this.appealDecision.length) {
      let res = 0;
      for (const d of this.appealDecision) {
        res += d.decision ? 1 : -1;
      }
      if (res > 0) {
        this.gameField.announceGameState(Language.getTranslatedText("appeal-approved"));
        let cost = this.currentQuestion.cost;
        if (this.currentQuestion.type === 'final' || 
            this.currentQuestion.type === 'bet') {
              cost = this.bets[this.lastAnswer.who];
          }
        this.points[this.lastAnswer.who] += +cost * 2;
        this.updatePoints();
      } else {
        this.gameField.announceGameState(Language.getTranslatedText("appeal-denied"));
      }
      this.nextTurn();
    }
  }

  onAppeal = evt => {
    if (new User().name === evt.who) return;
    if (new User().name === this.master) return;
    this.gameField.appealPopUp(
      this.lastAnswer.who,
      this.lastAnswer.ans,
      this.lastAnswer.t,
      this.lastAnswer.f
      );
  }

  onNextPicker = evt => {
    this.gameField.announceGameState(evt.who + Language.getTranslatedText("someone's-move"));
    if (new User().name !== evt.who) {
      this.clickConfig.cell = null;
      this.clickConfig.theme = null;
    } else if (new User().name === evt.who) {
      this.clickConfig.cell = this.onQuestionClick;
      this.clickConfig.theme = this.onThemeClick;
    }
  }

  onStartGame = evt => {
    this.gameStatus = 1;
    this.gameTimer.setTimer(GAMETIME);
    this.gameField.drawTable(this.rounds[this.currentRound]);
  }

  onPause = evt => {
    this.clickConfig.pause = this.resume;
    this.gameField.pause(evt.timeStamp);
    this.gameTimer.pause(evt.timeStamp);
    this.turnTimer.pause();
    if (this.appealTimerID) this.appealTimerID.pause();
    if (this.turnTimerID) this.turnTimerID.pause();
  }

  onResume = evt => {
    this.clickConfig.pause = this.pause;
    this.gameField.pause(evt.timeStamp);
    this.turnTimer.resume();
    this.gameTimer.resume();
    if (this.appealTimerID) this.appealTimerID.resume();
    if (this.turnTimerID) this.turnTimerID.resume();
  }

  onClickedTheme = evt => {
    if (new User().name === this.master) this.setNextPicker();
    const theme = this.gameField.removeFinalTheme(evt.index);
    if (this.gameField.isNullThemes()) {
      console.log('LastTheme', theme);
      let q = null;
      for (let d of this.bundle.getFinalDecks()) {
        console.log(d);
        if (d.subject === theme) q = d.questions[0];
      }
      console.log(q);
      const event = {
        eType: 'showQuestion',
        question: q,
      };
      this.broadcast(event);
    }
  }

  onBetBtn = evt => {
    const cost = +document.getElementById('betSize').value;
    if (cost < 0) return;
    const event = {
      eType: 'setBetCost',
      who: new User().name,
      'cost': cost,
    };
    this.gameField.hideBet();
    this.broadcast(event);
  }

  onSetBetCost = evt => {
    this.bets[evt.who] = evt.cost;
    if (new User().name !== this.master) return;
    if (Object.keys(this.bets).length === this.players.length - 1) {
      const event = {
        eType: 'forseShowQ',
        who: new User().name,
        canRaise: this.players,
      };
      this.broadcast(event);
    }
  }

  forseShowQ = evt => {
    this.gameField.drawQuestion(this.currentQuestion.string, () => {
      if (new User().name === this.master) this.canRaiseHand(evt.canRaise);
    });
  }

  onNewCurrentRound = evt => {
    this.currentRound = evt.round;
  }
  
  eventsConfig = {
    'leave': this.onLeaveGame,
    'turnOrder': this.onTurnOrder,
    'join': this.onJoinGame,
    'points': this.onPoints,
    'setGM': this.onSetGM,
    'showQuestion': this.onShowQuestion,
    'answerCheck': this.onAnswerCheck,
    'nextTurn': this.onNextTurn,
    'canAppeal': this.onCanAppeal,
    'appeal': this.onAppeal,
    'nextPicker': this.onNextPicker,
    'clickedTheme': this.onClickedTheme,
    'startGame': this.onStartGame,
    'appealDecision': this.onAppealDecision,
    'pause': this.onPause,
    'resume': this.onResume,
    'setBetCost': this.onSetBetCost,
    'forseShowQ': this.forseShowQ,
    'newCurrentRound': this.onNewCurrentRound,
     
  };

  socketHandler = msg => {
    const prsdMsg = JSON.parse(msg.data);
    if (prsdMsg.mType !== 'broadcastedEvent') return;
    const event = prsdMsg.data.data.event;
    const handler = this.eventsConfig[event.eType];
    if (!handler) return console.log(`no handler for |${event.eType}| type event`);
    handler(event);
    this.gameField.highlightCurrentPlayer(new User().name);
  }

  exit = () => {
    this._prepForExit();
    const event = {
      eType: 'leave',
      name: new User().name,
    };
    if (this.master === new User().name) {
      const index = this.players.indexOf(this.master);
      this.players.splice(index, 1);
      const msg = {
        mType: 'newGameMaster',
        data: {
          roomID: this._id,
          newGM: this.players[0],
        }
      };
      this._socket.send(JSON.stringify(msg));
    }
    console.log('leave game-id ' + this._id);
    this._socket.send(JSON.stringify({mType: 'leaveGame', data: { roomID: this._id }}));
    this.broadcast(event);
    delete this;
  }

  join() {
    this.gameField.buttonMode();
    this.gameField.waitForPlayersJpgShow();
    for (const player of this.players) this.gameField.addPlayer(player);
    const event = {
      eType: 'join',
      name: new User().name,
    };
    this.broadcast(event);
  }

  onQuestionClick = e => {
    const target = e.target;
    const splitedID = target.id.split('-');
    const i = splitedID[1] - 1;
    const j = splitedID[2] - 1;
    const q = this.bundle.decks[i].questions[j];
    const event = {
      eType: 'showQuestion',
      question: q,
      who: new User().name,
    };
    this.broadcast(event);
    console.log(q);
  }

  answer = () => {
    const ans = document.getElementById('input-answer');
    if (!ans.value) return;
    this.turnTimerID.pause();
    this.turnTimer.pause();
    document.getElementById('answer-btn').disabled = true;
    const event = {
      eType: 'answerCheck',
      answer: ans.value,
      who: new User().name,
    };
    this.broadcast(event);
  }

  appeal = () => {
    this.appealTimerID.pause();
    const event = {
      eType: 'appeal',
      who: new User().name,
    };
    this.broadcast(event);
    document.getElementById('answer-btn').disabled = true;
  }

  raiseHand = () => {
    this.turnTimer.setTimer(ANSWERTIME);
    this.gameField.answerMode();
    this.clickConfig.answer = this.answer;
    this.turnOrder([new User().name]);
    this.turnTimerID = new Timer(() => {
      this.points[new User().name] -= this.currentQuestion.cost;
      this.updatePoints();
      this.gameField.buttonMode();
      document.getElementById('answer-btn').disabled = true;
      this.nextTurn();
    }, ANSWERTIME * 1000);
  }

  correct = evt => {
    const name = document.getElementById('answer-author').textContent;
    let cost = this.currentQuestion.cost;
    if (this.currentQuestion.type === 'final' ||
        this.currentQuestion.type === 'bet') {
          cost = +this.bets[name];
      }
    this.points[name] += cost;
    this.updatePoints();
    this.gameField.gmPopHide();
    this.nextTurn();
  }

  nextTurn() {
    const event = {
      eType: 'nextTurn',
      who: this.players,
    };
    this.broadcast(event);
    this.setNextPicker();
  }

  uncorrect = evt => {
    const name = document.getElementById('answer-author').textContent;
    if (this.currentQuestion.type !== 'sponsored') {
      let cost = this.currentQuestion.cost;
      if (this.currentQuestion.type === 'final' || 
          this.currentQuestion.type === 'bet') {
            cost = this.bets[name];
        }
      this.points[name] -= +cost;
      this.updatePoints();
      const appealEvent = {
        eType: 'canAppeal',
        who: name,
      };
      this.broadcast(appealEvent);
    }
    this.gameField.gmPopHide();

  }

  disagreeWithApeal = evt => {
    const appealEvent = {
      eType: 'appealDecision',
      who: new User().name,
      decision: false,
    };
    this.broadcast(appealEvent);
    this.gameField.appealPopHide();
  }

  agreeWithApeal = evt => {
    const appealEvent = {
      eType: 'appealDecision',
      who: new User().name,
      decision: true,
    };
    this.broadcast(appealEvent);
    this.gameField.appealPopHide();
  }

  startGame = () => {
    if (this.players.length < 3) {
      return false;
    }
    this.setNextPicker();
    this.gameField.hideStartButton();
    const event = {
      eType: 'startGame',
    };
    this.broadcast(event);
    this._socket.send(JSON.stringify({ mType: 'updateGameStatus', data: { 
      roomID: this._id,
      running: true,
    }}));
  }

  setNextPicker(name) {
    if (!name) {
      let next = this.playersIterator ? this.playersIterator.next() : false;
      if (!next || next.value === undefined || next.done === true) {
        this.playersIterator = this.players.values();
        this.playersIterator.next(); // skip GM
        next = this.playersIterator.next();
      }
      name = next.value
    }
    const event = {
      eType: 'nextPicker',
      who: name,
    };
    this.broadcast(event);
  }

  submitPoints = () => {
    this.gameField.scoreAsInput(false)();
    this.points = this.gameField.collectScores();
    this.updatePoints();
  }

  changePoints = () => {
    this.gameField.scoreAsInput(true)();
  }

  pause = () => {
    const event = {
      eType: 'pause',
      timeStamp: Date.now(),
    };
    this.broadcast(event);
  }

  resume = () => {
    const event = {
      eType: 'resume',
      timeStamp: Date.now(),
    };
    this.broadcast(event);
  }

  onThemeClick = e => {
    const target = e.target;
    const splitedID = target.id.split('-');
    const i = splitedID[1];
    const event = {
      eType: 'clickedTheme',
      index: i,
    };
    this.broadcast(event);
  }

  onIconClick = e => {
    this.clickConfig.icon = null;
    const target = e.target;
    const splitedID = target.id.split('-');
    const name = splitedID[1];
    this.canRaiseHand(name);
    const event = {
      eType: 'forseShowQ',
      who: new User().name,
      canRaise: [name],
    };
    this.broadcast(event);
  }

  clickConfig = {
    'cell': this.onQuestionClick,
    'theme': this.onThemeClick,
    'answer': this.raiseHand,
    'correct': this.correct,
    'uncorrect': this.uncorrect,
    'exit': changeHash('chooseMode'),
    'disagreeWithApeal': this.disagreeWithApeal,
    'agreeWithApeal': this.agreeWithApeal,
    'report': () => alert('нуда нуда'),
    'pause': this.pause,
    'startGame': this.startGame,
    'changePoints': this.changePoints,
    'submitPoints': this.submitPoints,
    'resume': this.resume,
    'bet': this.onBetBtn,
    'icon': null,

  };

  clickHandler = (e) => {
    const id = e.target.id.split('-')[0];
    const handler = this.clickConfig[id];
    if (!handler) return console.log(`no handler for this |id:${id}| button`);
    handler(e);
  }

  init() {
    this.gameField.waitForPlayersJpgShow();
    this.gameField.addPlayer(new User().name);
    this.gameField.switchGameMode(true);
    this.clickConfig.cell = null;
    this.drawStartOrWait();
  }

  checkAnswerCounter() {
    this.answerCounter++;
    if (this.currentRound === 3 && this.answerCounter === 1) { //3, 1
      const winner = Object.entries(this.points).sort(([,a], [,b]) => b - a)[0][0];
      //show win window
      this.gameField.congratulate(winner)
      this.exit();
    } else if (this.answerCounter === 14) {
      this.answerCounter = 0;
      this.currentRound++;
    }
  }

  turnOrder(who) {
    const event = {
      eType: 'turnOrder',
      who: who,
      calledBy: new User().name,
    };
    this.broadcast(event);
  }

  canRaiseHand(who) {
    this.turnOrder(who);
  }

  updatePoints() {
    const event = {
      eType: 'points',
      points: this.points,
    };
    this.broadcast(event);
  }

  broadcast(...events) {
    for (const event of events) {
      this._socket.send(JSON.stringify({ mType: 'broadcastInRoom', data: {
        event: event,
        roomID: this._id,
      }})); 
    }
  }

  addPlayer(name) {
    this.players.push(name);
  }

  setMaster(master) {
    this.master = master;
  }

  setID(id) {
    if (id) this._id = id;
  }
}
