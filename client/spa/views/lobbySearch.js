'use strict';

const view = () => {
  return `<div class="row" style="height: 100%; margin: 0 0 0 0;">
    <div class="col-sm-3" style="padding: 0 5px 0 5px; border-right: 2px solid #010101">
      <select id="select-games-by-type" class="join-side-widget">
        <option value="allGames" data-localize="all-games">All games</option>
        <option value="pass" data-localize="pass">With password</option>
        <option value="nopass" data-localize="nopass">Without password</option>
      </select>
      <input type="text" class="join-side-widget" placeholder="Find your game!" id="find-games" data-localize="find-games">
      <div id="games-search" style="width: 100%"></div>
    </div>
    <div class="col-sm-9" style="padding: 0 0 0 30px;" id="picture-info-1"><img style="display: block; width: 50%; height: auto; margin-left: auto; margin-right: auto;" src="lobbySearchImage.jpg"></img></div>
    <div class="col-sm-9" style="padding: 0 0 0 30px; display:none" id="picture-info-2">
      <h1 class="highlighted-header" style="margin-left: -30px; padding-left: 30px;">
        <span id="search-title"></span>
      </h1>
      <h3 class="spaced-text"><span data-localize="mode">Mode</span>: <span id="search-mode"></span></h3>
      <h3 class="spaced-text"><span data-localize="question-bundle-word">Question Bundle</span>: <span id="search-question-bundle"></span></h3>
      <h3 class="spaced-text"><span data-localize="game-master">Game master</span>: <span id="search-gm"></span></h3>
      <h3 class="spaced-text"><span data-localize="players-word">Players</span>: <span id="search-players"></span></h3>
      <h3 class="spaced-text" id="password-to-enter">
      <span data-localize="password-word">Password</span>: 
      <input type="password" id="search-password" style="max-width: 70vw">
      </h3>

      <div id="game-running" style="width: 100%; background-color:red; display: none;" data-localize="game-running;">Game has already started</div>
      
      <div class="search-btns">
        <button class="btn dark-b-hover game-button" style="width: 100%;" id="join-player" data-localize="join">Join</button>
      </div>
    </div>
  </div>
  `;
}

export default view;
