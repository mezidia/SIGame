'use strict';

const view = () => {
  return `
  <div id="pause-overlay" class="overlay">
    <div class="overlay-content">
      <h1 class="text-white" data-localize="pause">Pause</h1>
      <br>
      <br>
      <button id="resume" class="btn bg-yellow" data-localize="continue">Continue</button>
    </div>
  </div>
  <div class="row" style="margin: 0 0 0 0; height: 100%">
    <div class="col-md-9 game-container" style="padding: 0 0 0 0;">
      <div id="answer-timer">
        <div class="fill-side-bar"></div>
        <div class="main-side-bar"></div>
        <div class="fill-side-bar"></div>
      </div>
      <div id="game-display" class="row" style="min-height: 200px; margin: 0 0 0 0"></div>
      
      <div>
        <div id="state-line">
          <div id="game-state-text"></div>
        </div>
        <div id="players-icons" style="display: flex; justify-content: space-between; flex-wrap: wrap"></div>
      </div>
      <div id="reply" style="background-color: #7c7c7c">
        <input id="input-answer" type="text" style="display: block; width: calc(100% - 100px); height: 100%; float: left">
        <button id="answer-btn" class="btn bg-red game-button text-white" style="width: 100px; height: 100%" disabled></button>
      </div>
    </div>
    <div class="col-md-3 chat-container" style="padding: 0 0 0 0; overflow-y: auto; height: 100%">
      <div id="game-global-timer">
        <div class="main-side-bar"></div>
        <div class="fill-side-bar"></div>
      </div>
      <div id="chat" style="min-height: 70px; overflow: auto"></div>
      <div id="chat-input" style="background-color: #8c8c8c;">
        <input type="text" style="width: 100%; height: 50px;" id="message-input">
        <div class="game-button-placeholder">
          <button class="btn dark-b-hover game-button" id="changePoints-sums-btn" style="display: none;" data-localize="change-sums">Change sums</button>
          <button class="btn dark-y-hover game-button" id="pause-btn" data-localize="pause" style="grid-column: 1 / 3; grid-row: 1 / 2">Pause</button>
          <button class="btn dark-r-hover game-button" id="exit-btn" data-localize="exit" style="grid-column: 1 / 3; grid-row: 2 / 3">Exit</button>
        </div>
      </div>
    </div>
  </div>
  `;
};

export default view;
