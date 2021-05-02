'use strict';

export default class GameTimer {
  _currentTime = 0;
  _timerID = null;
  _lastTickTime = 0;
  _pauseTime = 0;
  _isPaused = false;

  constructor(divId) {
    this._id = divId;
  }

  _tick = () => {
    if (this._currentTime >= 0) {
      this._lastTickTime = Date.now();
      this.update();
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
    this.reset();
    this._currentTime = time;
    this._lastTickTime = Date.now();
    if (time <= 0) return new Error('Time mast be int and above 0');
    this._tick();
  }

  update() {
    const div = document.getElementById(this._id);
    div.innerHTML = this._currentTime.toString();
  }

  reset() {
    clearTimeout(this._timerID);
    const div = document.getElementById(this._id);
    div.innerHTML = '0';
    this._currentTime = 0;
    this._lastTickTime = 0;
    this._pauseTime = 0;
    this._isPaused = false;
  }
  
}


