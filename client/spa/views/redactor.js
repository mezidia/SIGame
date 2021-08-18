'use strict';

const view = () => {

  return `<div class="container">
    <form>
      <h2 data-localize="pack-title-word">Pack title</h2>
      <input id="bundleTitle-input" type="text" maxlength=200 required> <span>${new Date().toLocaleString('en-GB')}</span>
      <p data-localize="prime-meridian"></p>
      <h2 data-localize="author-word">Author</h2>
      <input id="bundleAuthor-input" type="text" maxlength=34 required>
      <h2 data-localize="language">Language:</h2>
      <select id="bundleLang-select" class="form-control">
        <option data-localize="german">German</option>
        <option data-localize="ukrainian">Ukrainian</option>
      </select>
      <br>
      <div class="form-check disabled">
        <label class="form-check-label">
          <input id="saveBundle-checkBox" class="form-check-input" type="checkbox">
          <h4 data-localize="save-to-db">Save your bundle to the database</h4>
        </label>
      </div>
      <br>
      <div id="rounds">
        <h2 data-localize="rounds-h2-1">Quantity of rounds before final</h2>
        <input type="number" value="3" id="round-num">
        <h2 data-localize="rounds-h2-2">Quantity of themes in a round</h2>
        <input type="number" value="5" id="theme-num">
        <h2 data-localize="rounds-h2-3">Quantity of questions in a theme</h2>
        <input type="number" value="5" id="question-num">
        <h2 data-localize="rounds-h2-4">Quantity of questions in final round</h2>
        <input type="number" value="7" id="fin-question-num">
        <button type="button" id="submit-size" class="btn dark-b-hover btn-lg btn-block" style="margin-top: 40px">OK</button>
      </div>
      <div style="height: 40px">      
    </form>
  </div>
  `;
};

export default view;
