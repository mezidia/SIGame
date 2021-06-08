'use strict';

export default class QReader {
  _startTime = 0;
  isPaused = false;
  _textBlock = null;
  _passedFromStart = 0;
  isActive = false;

  constructor(delta = 150) {
    this._delta = delta;
  }

  read (textBlock, startTime = this._startTime, delta = this._delta) {
    this.isActive = true;
    this._textBlock = textBlock;

    const children = textBlock.children;
    const lastLetter = document.getElementById('last-letter');
    // makes it repeat until the question is read
    const callback = () => {
      this._passedFromStart = Date.now() - startTime;
      let passed = this._passedFromStart;
      let index = 0;

      while (passed > delta) {
        children[index].style.color = 'red';
        passed -= delta;
        ++index;
        if(index >= children.length) break;
      }
      if(lastLetter.style.color === 'red') {
        this.isActive = false;
        const ev = new AnimationEvent('animationend');
        lastLetter.dispatchEvent(ev);
      } else if(!this.isPaused) {
        window.requestAnimationFrame(callback);
      }
    }
    window.requestAnimationFrame(callback);
  }

  resume(resumeTime) {
    this.isPaused = false;
    console.error(resumeTime);
    this.read(this._textBlock, resumeTime - this._passedFromStart)
  }

  pause(stopTime = Date.now()) {
    this.isPaused = true;
    console.error(stopTime);
    this._passedFromStart -= Date.now() - stopTime;
    //this._startTime = stopTime - this._passedFromStart;
  }

  status() {
    console.log('startTime = ' + this._startTime);
    console.log('isPaused = ' + this.isPaused);
    console.log('textblock');
    console.log(this._textBlock);
  }
  
}
