'use strict';

import GameField from "../spa/views/gameField.js";
import User from "./user_class.js";
import Bundle from "./bundle_class.js";
import GameTimer from "./gameTimer_class.js";
import Timer from './timer_class.js';
import { changeHash } from "../spa/spaControl.js";
import { errPopup } from "../spa/uiElements.js";

const ANSWERTIME = 5; //sec
const GAMETIME = 500; //sec
const APPEALTIME = 5; //sec

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
    this.turnTimer = new GameTimer('answer-timer');
    this.gameTimer = new GameTimer('game-timer');
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
    console.log('new Game', this);
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
        this.gameField.drawStartButton();
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
    if (new User().name === this.master) this.updatePoints();
  }

  onPoints = evt => {
    this.points = evt.points;
    console.log(evt.points);
    this.gameField.updatePlayers(this.players, this.points);
  }

  onSetGM = evt => {
    this.master = evt.name;
  }

  onRegularQ = evt => {
    this.gameField.drawQuestion(evt.question.string, () => {
      if (new User().name === this.master) this.canRaiseHand(this.players);
    });
  }

  onSecretQ = evt => {
    this.gameField.drawQuestion(evt.question.string, () => {
      if (new User().name === this.master) this.canRaiseHand(this.players);
    });
  }

  onBetQ = evt => {
    this.gameField.drawQuestion(evt.question.string, () => {
      if (new User().name === this.master) this.canRaiseHand(this.players);
    });
  }

  qTypeConfig = {
    'regular': this.onRegularQ,
    'secret': this.onSecretQ,
    'bet': this.onBetQ,
    // 'sponsored': this.onSponsored,
  }

  onShowQuestion = evt => {
    this.currentQuestion = evt.question;
    const qHandler = this.qTypeConfig[this.currentQuestion.type];
    if (!qHandler) return console.log('Unknown q type');
    qHandler(evt);
  }

  onNextTurn = evt => {
    this.appealDecision = [];
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
    if (this.currentRound === 0) { // switch to 3 for production
      console.log(this.bundle.getFinalDecks());
      this.gameField.drawFinalRound(this.bundle.getFinalDecks());
    } else {
      this.gameField.drawTable(this.rounds[this.currentRound]);
    }
  }

  onAnswerCheck = evt => {
    this.gameField.announceGameState(`Ведучий перевіряє правильність відповіді.`);
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
    this.gameField.announceGameState(`Фаза апеляції.`);
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
        this.gameField.announceGameState(`Апеляція схвалена!`);
        this.points[this.lastAnswer.who] += this.currentQuestion.cost * 2;
        this.updatePoints();
      } else {
        this.gameField.announceGameState(`Апеляція відхилена!`);
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
    this.gameField.announceGameState(`${evt.who} ходить.`);
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
    this.gameField.pause();
    this.gameTimer.pause(evt.timeStamp);
    this.turnTimer.pause();
    if (this.appealTimerID) this.appealTimerID.pause();
    if (this.turnTimerID) this.turnTimerID.pause();
  }

  onResume = evt => {
    this.clickConfig.pause = this.pause;
    this.gameField.pause();
    this.turnTimer.resume();
    this.gameTimer.resume();
    if (this.appealTimerID) this.appealTimerID.resume();
    if (this.turnTimerID) this.turnTimerID.resume();
  }

  onClickedTheme = evt => {
    if (new User().name === this.master) this.setNextPicker();
    this.gameField.removeFinalTheme(evt.index);
    if (this.gameField.isNullThemes()) {
      console.log('LastTheme');
    }
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
  };

  socketHandler = msg => {
    const prsdMsg = JSON.parse(msg.data);
    if (prsdMsg.mType !== 'broadcastedEvent') return;
    const event = prsdMsg.data.data.event;
    const handler = this.eventsConfig[event.eType];
    if (!handler) return console.log(`no handler for |${event.eType}| type event`);
    handler(event);
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
    this.points[name] += this.currentQuestion.cost;
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
    if (this.currentQuestion.type !== 'noRisk') {
      this.points[name] -= +this.currentQuestion.cost;
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
      errPopup('start-min');
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
    if (this.canMove.length < 2) {
      this.canMove = [...this.players];
      this.canMove.splice(this.canMove.indexOf(this.master), 1);
      this.canMove.sort(() => Math.random() - 0.5);
    }
    name = name || this.canMove.pop();
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
    this.gameField.drawStartButton();
  }

  checkAnswerCounter() {
    this.answerCounter++;
    if (this.currentRound === 3 && this.answerCounter === 1) {
      const winner = Object.entries(this.points).sort(([,a], [,b]) => b - a)[0][0];
      //show win window
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
