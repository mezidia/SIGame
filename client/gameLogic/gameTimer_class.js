'use strict';

export default class GameTimer {
  _currentTime = 0;
  _timerID = null;

  constructor(divId) {
    this._id = divId;
  }

  setTimer(time) {
    this.reset();
    this._currentTime = time;
    if (time <= 0) return new Error('Time mast be int and above 0');
    const cb = () => {
      if (this._currentTime >= 0) {
        this.update();
        this._currentTime -= 1;
        this._timerID = setTimeout(cb, 1000);
      } else {
        clearTimeout(this._timerID);
      }
    };
    cb();
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
  }
  
}


