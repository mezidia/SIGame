'use strict';

const view = () => {
  return `<div class="row" style="margin: 0 0 0 0; height: 100%">
    <div class="col-md-9 game-container" style="padding: 0 0 0 0">
    
      <div id="game-display" class="row" style="min-height: 200px; margin: 0 0 0 0"></div>
      
      <div id="players-icons" style="background-color: #3c9a5f; display: flex; justify-content: space-between; flex-wrap: wrap"></div>
    
      <div id="reply" style="background-color: #7c7c7c">
        <input id="answerInput" type="text" style="display: block; width: calc(100% - 100px); height: 100%; float: left">
        <button id="answer-btn" class="btn btn-primary game-button" style="width: 100px; height: 100%" disabled></button>
      </div>
    </div>
    <div class="col-md-3 chat-container" style="padding: 0 0 0 0">
      <div id="chat" style="background-color: #6f42c1; min-height: 70px; overflow: auto">
      <-- timer exemple -->
      <div id="answer-timer">666</div>
      <-- timer exemple -->
      <-- timer exemple -->
      <div id="game-timer">666</div>
      <-- timer exemple -->
      </div>
      <div id="chat-input" style="background-color: #8c8c8c;">
        <input type="text" style="width: 100%; height: 50px;" id="message-input">
        <div class="game-button-placeholder">
          <button class="btn btn-primary game-button" id="change-sums-btn" style="display: none;" data-localize="change-sums">Change sums</button>
          <button class="btn btn-primary game-button" id="report-btn" style="grid-column: 1 / 3; grid-row: 1 / 2" data-localize="report">Report</button>
          <button class="btn btn-primary game-button" id="pause-btn" data-localize="pause">Pause</button>
          <button class="btn btn-primary game-button" id="exit-btn" data-localize="exit">Exit</button>
        </div>
      </div>
    </div>
  </div>
  `;
};



export default view;
