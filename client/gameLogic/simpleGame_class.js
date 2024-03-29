'use strict';


import User from "./user_class.js";
import Game from "./game_class.js";
import Language from "../language.js";
import { percentsOf } from '../utils.js'

const ANSWERTIME = 5; //sec
const GAMETIME = 300; //sec
const APPEALTIME = 5; //sec

export default class SimpleGame extends Game {

  _secretToRegularQType(decksArr) {
    decksArr = decksArr.flat();
    for (const deck of decksArr) {
      for (const q of deck.questions) {
        if (q.type === 'secret') q.type = 'regular';
      }
    }
  }

  constructor(bundle, settings, players) {
    super(bundle, settings, players);
    this.rounds = this.bundle.getRegularDecks().flat();
    this._secretToRegularQType(this.rounds);
    console.log(this.rounds);
  }

  onNextTurn = evt => {
    this.appealDecision = [];
    this.bets = {};
    this.clickConfig.answer = this.raiseHand;
    this.checkAnswerCounter();
    
    if (new User().name !== this.master) this.gameField.buttonMode();
    this.clickConfig.answer = this.raiseHand;
    this.currentQuestion = this.rounds[this.currentRound].questions[this.answerCounter];
    if (this.currentQuestion.type === 'secret') this.currentQuestion.type = 'regular';
    const event = {
      eType: 'showQuestion',
      question: this.currentQuestion,
      who: new User().name,
    };
    if (new User().name === this.master) this.broadcast(event);
  }

  onStartGame = evt => {
    this.gameStatus = 1;
    this.gameTimer.setTimer(GAMETIME);
    this.currentQuestion = this.rounds[this.currentRound].questions[this.answerCounter];
    if (this.currentQuestion.type === 'secret') this.currentQuestion.type = 'regular';
    const qHandler = this.qTypeConfig[this.currentQuestion.type];//this.qTypeConfig[this.currentQuestion.type];
    evt.question = this.currentQuestion;
    if (!qHandler) return console.log(`Unknown q type: ${this.currentQuestion.type}`);
    qHandler(evt, Language.getTranslatedText(this.currentQuestion.type));
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
    'newCurrentRound': this.onNewCurrentRound,
    'pause': this.onPause,
    'resume': this.onResume,
    'setBetCost': this.onSetBetCost,
    'forseShowQ': this.forseShowQ,
  };

  onNewCurrentRound = evt => {
    this.currentRound = evt.round;
  }

  nextTurn() {
    const event = {
      eType: 'nextTurn',
      who: this.players,
    };
    this.broadcast(event);
  }

  startGame = () => {
    if (this.players.length < 3) {
      errPopup('start-min');
      return false;
    }
    this.currentRound = 0;
    this.setCurrentRound(this.currentRound);
    const event = {
      eType: 'startGame',
    }; 
    this.broadcast(event);
    this._socket.send(JSON.stringify({ mType: 'updateGameStatus', data: { 
      roomID: this._id,
      running: true,
    }}));
  }

  setCurrentRound(roundIndex) {
    const event = {
      eType: 'newCurrentRound',
      round: roundIndex,
    };
    this.broadcast(event);
  }

  checkAnswerCounter() {
    this.answerCounter++;
    const qNum = this.rounds[this.currentRound].questions.length;
    const nOfQPerRound = percentsOf(qNum, 80);
    if (this.currentRound === this.bundle.roundsNum && this.answerCounter === 1) {
      const winner = Object.entries(this.points).sort(([,a], [,b]) => b - a)[0][0];
      //show win window
      const time = this.gameField.congratulate(winner);
      setTimeout(this.exit(), time);
    } else if (this.answerCounter === nOfQPerRound) {
      this.currentRound++;
      this.answerCounter = 0;
    }
  }

}


export { Game }
