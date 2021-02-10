'use strict';

const view = () => {
  return `<div class="row" style="margin: 0 0 0 0; height: 100%">
    <div class="col-md-9 game-container" style="padding: 0 0 0 0">
    
      <div id="game-display" class="row" style="min-height: 200px; margin: 0 0 0 0"></div>
      
      <div id="players-icons" style="background-color: #3c9a5f"></div>
    
      <div id="reply" style="background-color: #7c7c7c">
        <input type="text" style="display: block; width: calc(100% - 100px); height: 100%; float: left">
        <button class="game-button" style="width: 100px; height: 100%"></button>
      </div>
    </div>
    <div class="col-md-3 chat-container" style="padding: 0 0 0 0">
      <div id="chat" style="background-color: #6f42c1; min-height: 70px; overflow: auto"></div>
      <div id="chat-input" style="background-color: #8c8c8c;">
        <input type="text" style="width: 100%; height: 50px;" id="message-input">
        <div class="game-button-placeholder">
          <button class="game-button">button 1</button>
          <button class="game-button">button 2</button>
          <button class="game-button">button 3</button>
          <button class="game-button">button 4</button>
        </div>
      </div>
    </div>
  </div>
  `;
};

export default view;
