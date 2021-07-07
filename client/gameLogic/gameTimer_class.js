'use strict';

export default class GameTimer {
  _currentTime = 0;
  _timerID = null;
  _lastTickTime = 0;
  _pauseTime = 0;
  _isPaused = false;
  _totalTime = 0;

  // callback has to have (time left to the end: number, total Time of Game: number) contract
  constructor(callback) {
    this._callback = callback;
  }

  _tick = () => {
    if (this._currentTime >= 0) {
      this._lastTickTime = Date.now();
      this._callback(this._currentTime, this._totalTime);
      this._currentTime -= 1;
      this._timerID = setTimeout(this._tick, 1000);
    } else {
      clearTimeout(this._timerID);
    }
  }

  pause(pauseTime) {
    this._pauseTime = pauseTime;
    clearTimeout(this._timerID);
    this._isPaused = true;
  }

  resume() {
    if (!this._isPaused) throw new Error('This timer wasn\'t paused before!');
    const firstTickTime = 1000 - (this._pauseTime - this._lastTickTime);
    this._timerID = setTimeout(this._tick, firstTickTime);
    this._isPaused = false;
  }

  setTimer(time) {
    this._totalTime = time;
    this.reset(time);
    this._currentTime = time;
    this._lastTickTime = Date.now();
    if (time <= 0) return new Error('Time mast be int and above 0');
    this._tick();
  }

  reset() {
    clearTimeout(this._timerID);
    this._currentTime = 0;
    this._lastTickTime = 0;
    this._pauseTime = 0;
    this._isPaused = false;
  }
  
}


