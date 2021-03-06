'use strict';

const view = () => {
  return `<div class="container" style="max-width: 500px; margin-top: 7vh">
    <h1 style="text-align: center" data-localize="title" style="font-weight: 600">SI Game</h1>
    <form class="column-content" id="name">
      <input id="name-input" type="text" placeholder="Enter your name" pattern="[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+" title="May contain letters and/or numbers only" maxlength=34 style="min-height: 50px" data-localize="name" required>
      <button id="play-btn" type="submit" class="btn btn-50 dark-r-hover" data-localize="play">Start game</button>
      <button id="openEditor-btn" type="submit" class="btn btn-50 dark-b-hover" data-localize="bundle">Create bundle</button>
    </form>
  </div>
  `;
};

export default view;
