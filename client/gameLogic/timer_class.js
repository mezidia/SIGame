'use strict';

export default class Timer {
  _timerID = null;
  _callback = null;
  _startTime = 0;
  _remaining = 0;

  constructor(callback, delay) {
    this._remaining = delay;
    this._callback = callback;
    this.resume();
  }

  pause() {
    clearTimeout(this._timerId);
    this._remaining -= Date.now() - this._startTime;
  }
    
  resume() {
    this._startTime = Date.now();
    clearTimeout(this._timerId);
    this._timerId = setTimeout(this._callback, this._remaining);
  }

}
