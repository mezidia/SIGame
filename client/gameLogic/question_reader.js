'use strict';

export default class QReader {
  _startTime = 0;
  isPaused = false;
  _textBlock = null;
  _displayName = null;
  _display = null;
  _passedFromStart = 0;
  isActive = false;

  constructor(displayId) {
    this._displayName = displayId;
  }

  initDisplay() {
    if (!this._display) {
      this._display = document.getElementById(this._displayName);
    }
  }

  drawQuestion(str, callback, needToRead = true) {
    this.initDisplay();
    // noinspection CssInvalidPropertyValue
    this._display.innerHTML = `<span id="question-text">${[...str].map((letter, index) =>
      `<span ${(index === str.length - 1) ? 'id="last-letter"': ''}
          class="question-letter">${letter}</span>`).join('')}
    </span>`
    document.getElementById('last-letter').addEventListener('animationend', (evt) => {
      callback();
    });
    this._textBlock = document.getElementById('question-text');

    if (needToRead) {
      this.read(this._textBlock, Date.now())
    }
  }
 
  congratulate(name) {
    return this.flash(`Congratulations, ${name} has won!!`, 400, 5000);
  }

  flash(text, delta, total) {
    this.drawQuestion(text, () => {}, false);
    this._textBlock.style.textAlign = 'center';
    let isMainColor = true;
    const interval = setInterval(() => {
      const children = this._textBlock.children;
      for (let i = 0; i < children.length; ++i) {
        children[i].style.color = isMainColor ? 'red' : 'black';
      }
      isMainColor = !isMainColor;
    }, delta);
    setTimeout(() => clearInterval(interval), total);
    return total;
  }

  read (textBlock, startTime = this._startTime, delta = 150) {
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
    // this._passedFromStart -= Date.now() - stopTime;
    //this._startTime = stopTime - this._passedFromStart;
  }

  status() {
    console.log('display name ' + this._displayName);
    console.log('display ' + this._display);
    console.log('textBlock ' + this._textBlock);
    console.log('startTime = ' + this._startTime);
    console.log('isPaused = ' + this.isPaused);
    console.log('textblock');
    console.log(this._textBlock);
  }
  
}
