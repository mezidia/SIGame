'use strict';

const view = () => {
  return `<div class="container" style="max-width: 500px; margin-top: 15vh">
    <button id="create-game-btn" type="button" class="btn btn-primary btn-50" data-localize="create-game">Create new game</button>
    <button id="join-btn" type="button" class="btn btn-primary btn-50" data-localize="join-lobby">Join lobby</button>
  </div>
  `;
};

export default view;
