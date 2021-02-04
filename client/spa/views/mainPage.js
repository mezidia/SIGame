const view = () => {
  return `<div class="container" style="max-width: 500px; margin-top: 7vh">
    <h1 style="text-align: center">SI Game</h1>
    <form class="column-content" id="name">
      <input type="text" placeholder="Enter your name" pattern="[A-Za-zА-яҐґЇїІі0-9]+" title="May contain letters and/or numbers only" maxlength=34 style="min-height: 50px" required>
      <button type="submit" class="btn btn-primary btn-50">Create bundle</button>
      <button type="submit" class="btn btn-primary btn-50">Play</button>
    </form>
  </div>
  `;
};

export default view;
