'use strict';

const view = () => {
  return `<div class="container">
    <form>
      <h1 data-localize="new-game">New Game</h1>
      <h2 data-localize="title-word">Title</h2>
      <input id="roomName" type="text" required>
      
      <h2 data-localize="password-word">Password</h2>
      <input id="roomPassword" type="text" required>
      
      <h2 data-localize="question-bundle-word">Question bundle</h2>
      <select id="questionBundle" class="form-control">
        <option data-localize="random-word" value="random">Random</option>
        <option data-localize="download-word" value="download">Download</option>
        <option data-localize="findBundleByName-word" value="findByName">Find bundle by name</option>
      </select>    
      <input style="display: none; margin-top: 10px" id="bundle-file" type="file" accept=".json" />
      <input style="display: none; margin-top: 10px" id="bundleSearch-input" type="text" />
      
      <h2 data-localize="game-type-word">Game type</h2>
      <select id="gameMode" class="form-control">
        <option data-localize="classic-word">Classic</option>
        <option data-localize="simple-word">Simple</option>
      </select>
      
      <br>
      <h2 data-localize="players-word">Players</h2>
      <datalist id="tickmarks">
        <option value="2" label="2">
        <option value="3" label="3">
        <option value="4" label="4">
        <option value="5" label="5">
        <option value="6" label="6">
        <option value="7" label="7">
        <option value="8" label="8">
        <option value="9" label="9">
        <option value="10" label="10">
      </datalist>
      <input id="totalPlayers" type="range" max="10" min="2" list="tickmarks">

      <br>
      <br>
      <button type="button" class="btn btn-primary" data-localize="settings">Settings</button>
      <button id="startGame" type="button" class="btn btn-primary" data-localize="play">Start game</button>
      
    </form>
  </div>
  `;
};

export default view;
