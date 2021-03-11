'use strict';

import GameField from "../spa/views/gameField.js";
import User from "./user_class.js";
import { changeHash } from "../spa/spaControl.js";
import Bundle from "./bundle_class.js";


const ANSWERTIME = 5000;

export default class Game {
  _setListeners() {
    document.addEventListener('click', this.clickHandler);
    this._socket.addEventListener('message', this.socketHandler);
  }

  _removeListeners() {
    document.removeEventListener('click', this.clickHandler);
    this._socket.removeEventListener('message', this.socketHandler);
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
    this._setListeners();
    this.rounds = this.bundle.getRoundsArr();
    this.currentQuestion = undefined;
    this.currentRound = 0;
    this.answerCounter = 0;
    this.turnTimerID = undefined;
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
    console.log(this.players);
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
    this.clickConfig.answer = this.raiseHand;
    const decks = this.rounds[this.currentRound];
    console.log(this.currentQuestion.string);
    for (const dIndex in decks) {
      for (const qIndex in decks[dIndex].questions) {
        console.log(dIndex, qIndex);
        console.log(decks[dIndex].questions[qIndex]);
        if (!decks[dIndex].questions[qIndex]) continue;
        if (decks[dIndex].questions[qIndex].string === this.currentQuestion.string) {
          console.log(decks[dIndex].questions[qIndex].string, this.currentQuestion.string);
          //decks[dIndex].questions.splice(qIndex, 1);
          decks[dIndex].questions[qIndex] = null;
          break;
        }
      }
    }
    console.log(this.rounds[this.currentRound]);
    this.checkAnswerCounter();
    this.gameField.drawTable(this.rounds[this.currentRound]);
  }

  onAnswerCheck = evt => {
    if (this.master !== new User().name) return;
    console.log(this.currentQuestion);
    const t = this.currentQuestion.trueAns;
    const f = this.currentQuestion.falseAns;
    this.gameField.gmPopUp(evt.who, evt.answer, t, f);
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
  };

  socketHandler = (msg) => {
    const prsdMsg = JSON.parse(msg.data);
    if (prsdMsg.mType !== 'broadcastedEvent') return;
    const event = prsdMsg.data.data.event;
    const handler = this.eventsConfig[event.eType];
    if (!handler) console.log(`no handler for |${event.eType}| type event`);
    handler(event);
  }

  exit = () => {
    this._removeListeners();
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
    changeHash('chooseMode')();
    delete this;
  }

  join() {
    this.gameField.drawTable(this.rounds[this.currentRound]);
    for (const player of this.players) this.gameField.addPlayer(player);
    const event = {
      eType: 'join',
      name: new User().name,
    };
    this.broadcast(event);
  }

  onQuestionClick = (e) => {
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
    const canAnswer = (evt) => {
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
    console.log(ans.value);

  }

  raiseHand = () => {
    this.clickConfig.answer = this.answer;
    const event = {
      eType: 'turnOrder',
      who: [new User().name],
    };
    this.broadcast(event);
    this.turnTimerID = setTimeout(() => {
      this.points[new User().name] -= this.currentQuestion.cost;
      const event = {
        eType: 'turnOrder',
        who: this.players,
      };
      this.broadcast(event);
      this.updatePoints();
    }, ANSWERTIME);

  }

  correct = evt => {
    const name = document.getElementById('answer-author').textContent;
    this.points[name] += this.currentQuestion.cost;
    this.updatePoints();
    this.gameField.gmPopHide();
    const event = {
      eType: 'turnOrder',
      who: this.players,
    };
    this.broadcast(event);
    this.nextTurn();
  }

  nextTurn() {
    const event = {
      eType: 'nextTurn',
    };
    this.broadcast(event);
  }

  uncorrect = evt => {
    const name = document.getElementById('answer-author').textContent;
    this.points[name] -= +this.currentQuestion.cost;
    this.updatePoints();
    this.gameField.gmPopHide();
    const event = {
      eType: 'turnOrder',
      who: this.players,
    };
    this.broadcast(event);
    this.nextTurn();
  }

  clickConfig = {
    'cell': this.onQuestionClick,
    'answer': this.raiseHand,
    'correct': this.correct,
    'uncorrect': this.uncorrect,
    'exit': this.exit,
    'report': 'report',
    'pause': 'pause',
    'resume': 'resume',
  };

  clickHandler = (e) => {
    const id = e.target.id.split('-')[0];
    const handler = this.clickConfig[id];
    if (!handler) return console.log(`no handler for this |id:${id}| button`);
    handler(e);
  }

  init() {
    this.gameField.drawTable(this.rounds[this.currentRound]);
    this.gameField.addPlayer(new User().name);
    this.gameField.switchGameMode(true);
  }

  checkAnswerCounter() {
    this.answerCounter++;
    if (this.answerCounter === 14) {
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

  broadcast(event) {
    this._socket.send(JSON.stringify({ mType: 'broadcastInRoom', data: {
      event: event,
      roomID: this._id,
    }})); 
  }

  addPlayer(name) {
    this.players.push(name);
  }

  kikcPlayer() {

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
