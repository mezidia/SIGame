'use strict';

import GameField from "../spa/views/gameField.js";
import User from "./user_class.js";
import Bundle from "./bundle_class.js";
import GameTimer from "./gameTimer_class.js";
import { changeHash } from "../spa/spaControl.js";
import { appealPopup, errPopup } from "../spa/uiElements.js";



const ANSWERTIME = 5; //sec
const GAMETIME = 25; //sec
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
    clearTimeout(this.turnTimerID);
    clearTimeout(this.appealTimerID);
  }

  constructor(bundle, settings, players) {
    this._id = undefined;
    this._socket = new User().socket;
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

  onShowQuestion = evt => {
    this.gameField.drawQuestion(evt.question.string);
    this.currentQuestion = evt.question;
  }

  onNextTurn = evt => {
    this.appealDecision = [];
    this.clickConfig.answer = this.raiseHand;
    const decks = this.rounds[this.currentRound];
    for (const dIndex in decks) {
      for (const qIndex in decks[dIndex].questions) {
        if (!decks[dIndex].questions[qIndex]) continue;
        if (decks[dIndex].questions[qIndex].string === this.currentQuestion.string) {
          console.log(decks[dIndex].questions[qIndex].string, this.currentQuestion.string);
          //decks[dIndex].questions.splice(qIndex, 1);
          decks[dIndex].questions[qIndex] = null;
          break;
        }
      }
    }
    this.checkAnswerCounter();
    this.gameField.drawTable(this.rounds[this.currentRound]);
  }

  onAnswerCheck = evt => {
    const t = this.currentQuestion.trueAns;
    const f = this.currentQuestion.falseAns;
    this.lastAnswer = { 
      who: evt.who,
      ans: evt.answer,
      t,
      f,
    };
    if (this.master !== new User().name) return;
    console.log(this.currentQuestion);
    this.gameField.gmPopUp(evt.who, evt.answer, t, f);
  }

  onCanAppeal = evt => {
    if (evt.who !== new User().name) return;
    document.getElementById('answer-btn').disabled = false;
    this.clickConfig.answer = this.appeal;
    this.appealTimerID = setTimeout(() => {
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
        this.points[this.lastAnswer.who] += this.currentQuestion.cost * 2;
        this.updatePoints();
      }
      this.nextTurn();
    }
  }

  onAppeal = evt => {
    if (new User().name === evt.who) return;
    if (new User().name === this.master) return;
    //appealPopup(this.lastAnswer);
    this.gameField.appealPopUp(
      this.lastAnswer.who,
      this.lastAnswer.ans,
      this.lastAnswer.t,
      this.lastAnswer.f
      );
  }

  onNextPicker = evt => {
    if (new User().name !== evt.who) {
      this.clickConfig.cell = null;
    } else if (new User().name === evt.who) {
      this.clickConfig.cell = this.onQuestionClick;
    }
  }

  onStartGame = evt => {
    this.gameTimer.setTimer(GAMETIME);
    this.gameField.drawTable(this.rounds[this.currentRound]);
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
    'startGame': this.onStartGame,
    'appealDecision': this.onAppealDecision,
  };

  socketHandler = msg => {
    const prsdMsg = JSON.parse(msg.data);
    if (prsdMsg.mType !== 'broadcastedEvent') return;
    const event = prsdMsg.data.data.event;
    const handler = this.eventsConfig[event.eType];
    if (!handler) console.log(`no handler for |${event.eType}| type event`);
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
    this.gameField.drawQuestion(q.string);
    this.currentQuestion = q;
    const canAnswer = evt => {
      if (evt.target.id === 'last-letter') {
        const event = {
          eType: 'turnOrder',
          who: this.players,
        };
        this.broadcast(event);
        document.removeEventListener('animationend', canAnswer);
      }
    }
    document.addEventListener('animationend', canAnswer);
  }

  answer = () => {
    const ans = document.getElementById('answerInput');
    if (!ans.value) return;
    clearTimeout(this.turnTimerID);
    document.getElementById('answer-btn').disabled = true;
    const event = {
      eType: 'answerCheck',
      answer: ans.value,
      who: new User().name,
    };
    this.broadcast(event);
  }

  appeal = () => {
    clearTimeout(this.appealTimerID);
    const event = {
      eType: 'appeal',
      who: new User().name,
    };
    this.broadcast(event);
    document.getElementById('answer-btn').disabled = true;
  }

  raiseHand = () => {
    this.turnTimer.setTimer(ANSWERTIME);
    this.clickConfig.answer = this.answer;
    const event = {
      eType: 'turnOrder',
      who: [new User().name],
    };
    this.broadcast(event);
    this.turnTimerID = setTimeout(() => {
      this.points[new User().name] -= this.currentQuestion.cost;
      this.updatePoints();
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
    //setTimeout(() => this.nextTurn(), APPEALTIME * 1000);
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
      errPopup('min 3 players!');
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

  clickConfig = {
    'cell': this.onQuestionClick,
    'answer': this.raiseHand,
    'correct': this.correct,
    'uncorrect': this.uncorrect,
    'exit': changeHash('chooseMode'),
    'disagreeWithApeal': this.disagreeWithApeal,
    'agreeWithApeal': this.agreeWithApeal,
    'report': 'report',
    'pause': 'pause',
    'resume': 'resume',
    'startGame': this.startGame,
    'changePoints': () => this.gameField.scoreAsInput(true)(),
    'submitPoints': () => {
      this.gameField.scoreAsInput(false)();
      this.points = this.gameField.collectScores();
      this.updatePoints();
    },
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

  kickPlayer() {

  }

  pause() {
   
  }

  setMaster(master) {
    this.master = master;
  }

  setID(id) {
    if (id) this._id = id;
  }
}
