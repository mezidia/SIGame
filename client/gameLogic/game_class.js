'use strict';

import GameField from "../spa/views/gameField.js";
import User from "./user_class.js";




export default class Game {
  _setListeners() {
    document.addEventListener('click', this.clickHandler);
    this._socket.addEventListener('message', this.socketHandler);
  }

  _removeListeners() {
    document.removeEventListener('click', this.clickHandler);
    this._socket.removeEventListener('message', this.socketHandler);
  }

  constructor(bundle, settings) {
    this._id = undefined;
    this._socket = new User().socket;
    this.master = settings.name;
    this.roomName = settings.roomName;
    this.maxPpl = settings.ppl;
    this.password = settings.password;
    this.gameMode = settings.gameMode;
    this.bundle = bundle;
    this.players = [ settings.name, 'test' ];
    this.points = { [settings.name]: 0, 'test': 0 };
    this.gameField = new GameField();
    this._setListeners();
    this.currentQuestion = undefined;
    this.turnTimerID = undefined;
    console.log('new Game');
  }

  onLeaveGame = evt => {
    const index = this.players.indexOf(evt.name);
    this.players.splice(index, 1);
  }

  onTurnOrder = evt => {
    if (evt.who.includes(new User().name)) {
      document.getElementById('answer-btn').disabled = false;
    } else {
      document.getElementById('answer-btn').disabled = true;
    }
  
  }

  onJoinGame = evt => {
    this.players.push(evt.name);
  }

  onPoints = evt => {
    this.points = evt.points;
    //updatePoints();
  }

  eventsConfig = {
    'leave': this.onLeaveGame,
    'turnOrder': this.onTurnOrder,
    'join': this.onJoinGame,
    'points': this.onPoints,
  };

  socketHandler = (msg) => {
    const prsdMsg = JSON.parse(msg.data);
    if (prsdMsg.mType !== 'broadcastedEvent') return;
    const event = prsdMsg.data.data.event;
    const handler = this.eventsConfig[event.eType];
    if (!handler) console.log(`no handler for |${event.eType}| type event`);
    handler(event);
  }

  exit() {
    this._removeListeners();
    const event = {
      eType: 'leave',
      name: new User().name,
    };
    this.broadcast(event);
  }

  join() {
    const event = {
      eType: 'join',
      name: new User().name,
    };
    this.broadcast(event);
  }

  showQuestion = (e) => {
    const target = e.target;
    const splitedID = target.id.split('-');
    const i = splitedID[1] - 1;
    const j = splitedID[2] - 1;
    const q = this.bundle.decks[i].questions[j];
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
    clearTimeout(this.turnTimerID);
    const ans = document.getElementById('answerInput');
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
    }, 5000);

  }

  clickConfig = {
    'cell': this.showQuestion,
    'answer': this.raiseHand,
  };

  clickHandler = (e) => {
    const id = e.target.id.split('-')[0];
    const handler = this.clickConfig[id];
    if (!handler) return console.log(`no handler for this |${id}| button`);
    handler(e);
  }

  init() {
    this.gameField.drawTable(this.bundle.round_1);
  }

  setupQuestiones() {

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
    this.players.name = name;
  }

  kikcPlayer() {

  }

  pause() {
   
  }

  gameLoop() {

  }

  setMaster(master) {
    this.master = master;
  }

  setID(id) {
    if (id) this._id = id;
  }
}
