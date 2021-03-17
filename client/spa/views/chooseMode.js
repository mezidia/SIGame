'use strict';

const view = () => {
  return `<div class="container" id="choose-mode-container">
    <div>
      <button id="create-game-btn" type="button" class="btn btn-primary btn-50 choose-mode-btn" data-localize="create-game">Create new game</button>
      <button id="join-btn" type="button" class="btn btn-primary btn-50 choose-mode-btn" data-localize="join-lobby">Join lobby</button>
      <button  type="button" class="btn btn-primary btn-50 choose-mode-btn">ЗРОБИ МЕНІ ТАЙМЕР БУДЬ ЛАСКА</button>
    </div>
  </div>
  `;
};

export default view;
