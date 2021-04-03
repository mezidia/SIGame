'use strict';


import User from "./user_class.js";
import Game from "./game_class.js";
import { getRandomIntInclusive } from "../utils.js";

const ANSWERTIME = 5; //sec
const GAMETIME = 25; //sec
const APPEALTIME = 5; //sec

export default class SimpleGame extends Game {
  constructor(bundle, settings, players) {
    super(bundle, settings, players);
    this.rounds = this.bundle.getRegularDecks();
  }

  onNextTurn = evt => {
    this.appealDecision = [];
    this.clickConfig.answer = this.raiseHand;
    this.checkAnswerCounter();
    this.currentQuestion = this.rounds[this.currentRound].questions[this.answerCounter];
    this.gameField.drawQuestion(this.currentQuestion.string);
    if (new User().name === this.master) {
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
  }

  onStartGame = evt => {
    this.currentQuestion = this.rounds[this.currentRound].questions[this.answerCounter];
    this.gameTimer.setTimer(GAMETIME);
    this.gameField.drawQuestion(this.currentQuestion.string);
    if (new User().name === this.master) {
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
      errPopup('min 3 players!');
      return false;
    }
    this.currentRound = getRandomIntInclusive(0, this.rounds.length - 1);
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
    if (this.answerCounter === 25) {
      const winner = Object.entries(this.points).sort(([,a], [,b]) => b - a)[0][0];
      //show win window
      this.exit();
    } else if (this.answerCounter % 5 === 0) {
      this.currentRound++;
      this.answerCounter = 0;
    }
  }

}