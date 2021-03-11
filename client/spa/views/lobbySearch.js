'use strict';

const view = () => {
  return `<div class="row" style="height: 100%; margin: 0 0 0 0;">
    <div id="games-search" class="col-sm-3" style="background-color: #6f42c1; padding: 0 0 0 0;"></div>
    <div class="col-sm-9" style="padding: 0 0 0 30px;">
      <h1 class="text-white spaced-text" style="margin-left: -30px; padding-left: 30px; background-color: #008cba">
        <span id="search-title"></span>
      </h1>
      <h3 class="spaced-text"><span data-localize="mode">Mode</span>: <span id="search-mode"></span></h3>
      <h3 class="spaced-text"><span data-localize="question-bundle-word">Question Bundle</span>: <span id="search-question-bundle"></span></h3>
      <h3 class="spaced-text"><span data-localize="game-master">Game master</span>: <span id="search-gm"></span></h3>
      <h3 class="spaced-text"><span data-localize="players-word">Players</span>: <span id="search-players"></span></h3>
      <h3 class="spaced-text"><span data-localize="password-word">Password</span>: <input type="password" id="search-password" style="max-width: 70vw"></h3>
      
      <div class="search-btns">
        <button class="btn btn-primary game-button" style="width: 100%;" id="join-player">Join</button>
      </div>
    </div>
  </div>
  `;
};

export default view;
