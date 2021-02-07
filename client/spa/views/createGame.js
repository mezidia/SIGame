const view = () => {
  return `<div class="container">
    <form>
      <h1 data-localize="new-game">New Game</h1>
      <h2 data-localize="title-word">Title</h2>
      <input id="roomName" type="text">
      
      <h2 data-localize="password-word">Password</h2>
      <input id="roomPassword" type="text">
      
      <h2 data-localize="question-bundle-word">Question bundle</h2>
      <select id="questionBundle" class="form-control" id="select-question">
        <option data-localize="random-word">Random</option>
        <option data-localize="download-word">Download</option>
      </select>    
      <input id="bundle-file" type="file" accept=".json" />
      
      <h2 data-localize="game-type-word">Game type</h2>
      <select id="gameMode" class="form-control" id="select-game-type">
        <option data-localize="classic-word">Classic</option>
        <option data-localize="simple-word">Simple</option>
      </select>
      
      <h2 data-localize="role-word">Role</h2>
      <select id="role" class="form-control" id="select-role">
        <option data-localize="player-word">Player</option>
        <option data-localize="game-master-word">Game master</option>
      </select>
      
      <br>
      <h2 data-localize="players-word">Players</h2>
      <br>
      <h2 data-localize="total-word">Total</h2>
      <input id="totalPlayers" type="range" max="10" min="1">
      
      <h2 data-localize="people-word">People</h2>
      <input id="ppl" type="range" max="10" min="1">
      
      <br>
      
      <button type="button" class="btn btn-primary" data-localize="settings">Settings</button>
      <button id="startGame" type="button" class="btn btn-primary" data-localize="play">Start game</button>
      
    </form>
  </div>
  `;
};

export default view;
