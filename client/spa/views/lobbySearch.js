'use strict';

const view = () => {
  return `<div class="row" style="height: 100%; margin: 0 0 0 0;">
    <div class="col-sm-3" style="background-color: #6f42c1; padding: 0 0 0 0;" id="games-search">
    </div>
    <div class="col-sm-9" style="padding: 0 0 0 30px;">
      <h1 class="text-white spaced-text" style="margin-left: -30px; padding-left: 30px; background-color: #008cba">
        <span id="search-title"></span>
      </h1>
      <h3 class="spaced-text">Owner: <span id="search-owner"></span></h3>
      <h3 class="spaced-text">Mode: <span id="search-mode"></span></h3>
      <h3 class="spaced-text">Question bundle: <span id="search-question-bundle"></span></h3>
      <h3 class="spaced-text">Game master: <span id="search-gm"></span></h3>
      <h3 class="spaced-text">Players: <span id="search-players"></span></h3>
      <h3 class="spaced-text">Password: <input type="password" id="search-password" style="max-width: 70vw"></h3>
      
      <div class="search-btns">
        <button class="btn btn-primary game-button" style="width: 50%" id="join-gm">Join as Game Master</button>
        <button class="btn btn-primary game-button" style="width: 50%;" id="join-player">Join as Player</button>
      </div>
    </div>
  </div>
  `;
};

export default view;
