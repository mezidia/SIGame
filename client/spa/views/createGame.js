'use strict';

const view = () => {
  return `<div class="container">
    <form>
      <h1 data-localize="new-game">New Game</h1>
      <h2 data-localize="title-word">Title</h2>
      <input id="roomName" type="text" required>
      
      <h2 data-localize="password-word">Password</h2>
      <select id="type-of-password" class="form-control">
        <option value="nopass" data-localize="nopass">Without password</option>
        <option value="pass" data-localize="pass">With password</option>
      </select>
      <input id="roomPassword" style="display: none; margin-top: 10px" type="text">
      
      <h2 data-localize="question-bundle-word">Question bundle</h2>
      <select id="questionBundle" class="form-control">
        <option data-localize="random-word" value="random">Random</option>
        <option data-localize="download-word" value="download">Download</option>
        <option data-localize="findBundleByName-word" value="findByName">Find bundle by name</option>
      </select>    
      <input style="display: none; margin-top: 10px" id="bundle-file" type="file" accept=".json" />
      <input style="display: none; margin-top: 10px" id="bundleSearch-input" type="text" />
      <div class="bundle-search-container">
        <div id="bundleSearch-input-autocomplete" style="display: none;"></div>
      </div>

      <h2 data-localize="game-type-word">Game type</h2>
      <select id="gameMode" class="form-control">
        <option data-localize="classic-word">Classic</option>
        <option data-localize="simple-word">Simple</option>
      </select>

      <br>
      <button id="startGame" type="button" class="btn dark-b-hover" data-localize="play" style="width: 100%; padding-top: 10px; padding-bottom: 10px">Start game</button>
      
    </form>
  </div>
  `;
};

export default view;
