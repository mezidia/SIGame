const view = () => {
  return `<div class="container">
    <form>
      <h1>New Game</h1>
      <h2>Title</h2>
      <input type="text">
      
      <h2>Password</h2>
      <input type="text">
      
      <h2>Question bundle</h2>
      <select class="form-control" id="select-question">
        <option>Random</option>
        <option>Download</option>
      </select>    
      
      <h2>Game type</h2>
      <select class="form-control" id="select-game-type">
        <option>Simple</option>
        <option>Classic</option>
      </select>
      
      <h2>Role</h2>
      <select class="form-control" id="select-role">
        <option>Player</option>
        <option>Game master</option>
      </select>
      
      <br>
      <h2>Players</h2>
      <br>
      <h2>Total:</h2>
      <input type="range" max="10" min="1">
      
      <h2>People</h2>
      <input type="range" max="10" min="1">
      
      <br>
      
      <button type="button" class="btn btn-primary">Settings</button>
      <button type="submit" class="btn btn-primary">Start game</button>
      
    </form>
  </div>
  `;
};

export default view;
