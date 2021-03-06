'use strict';

const view = () => {
  const questionList = (roundNumber, themeNumber) => {
    return [1, 2, 3, 4, 5].map(i => `
      <h5><span data-localize="question">Question</span> ${i}: ${i*roundNumber}00 <span data-localize="points">points</span></h5>
      <p data-localize="sep-answers">Separate true and wrong answers via comas</p>
      <input type="text" placeholder="Question" maxlength=200 id="question-${roundNumber}-${themeNumber}-${i}" data-localize="input-question" required>
      <input type="text" placeholder="Answers" maxlength=300 id="answer-${roundNumber}-${themeNumber}-${i}" data-localize="answers" required>
      <input type="text" placeholder="Wrong answers(optional)" maxlength=300 id="wrong-answer-${roundNumber}-${themeNumber}-${i}" data-localize="wrong-answers-input">
      <h5 data-localize="optional">Optional</h5>
      <div id="audio_cont-${roundNumber}-${themeNumber}-${i}">
        <label for="audio" data-localize="input-audio">Select audio for a question</label>
        <input type="file" class="exclude" id="audio-${roundNumber}-${themeNumber}-${i}" name="audio" accept=".mp3,.ogg">
      </div>
      <div id="img_cont-${roundNumber}-${themeNumber}-${i}">
        <label for="image" data-localize="input-image">Select image for a question</label>
        <input type="file" class="exclude" id="img-${roundNumber}-${themeNumber}-${i}" name="image" accept=".jpeg,.jpg,.png">
      </div>
      `).join('\n');
  }

  const finalQuestionList = () => {
    return [1, 2, 3, 4, 5, 6, 7].map(i => `
      <h5 data-localize="question">Question ${i}</h5>
      <input type="text" placeholder="Category" id="final-theme-${i}" data-localize="input-category" required>  
      <br>
      <br>
      <input type="text" placeholder="Question" maxlength=200 id="question-4-1-${i}" data-localize="input-question" required>
      <input type="text" placeholder="Answers" maxlength=300 id="answer-4-1-${i}" data-localize="answers" required>
      <input type="text" placeholder="Wrong answers(optional)" maxlength=300 id="wrong-answer-4-1-${i}" data-localize="wrong-answers-input">
      <input type="text" placeholder="Question type" id="question-type-4-1-${i}" data-localize="question-type" required>
      <h5 data-localize="optional">Optional</h5>
      <div id="audio_cont-4-1-${i}">
        <label for="audio" data-localize="input-audio">Select audio for a question</label>
        <input type="file" class="exclude" id="audio-4-1-${i}" name="audio" accept=".mp3,.ogg">
      </div>
      <div id="img_cont-4-1-${i}">
        <label for="image" data-localize="input-audio">Select image for a question</label>
        <input type="file" class="exclude" id="img-4-1-${i}" name="image" accept=".jpeg,.jpg,.png">
      </div>`).join('\n');
  }

  const themesList = roundNumber => {
    return [1, 2, 3, 4, 5].map(i => `
        <h3><span data-localize="category">Category</span> ${i}</h3>
        <div class="collapse show">
          <h4 data-localize="category-name">Category name</h4>
          <input type="text" maxlength=200 id="category-name-${roundNumber}-${i}" required>
      
          <h5 data-localize="secret-question">Secret question</h5>
          <select id="secretIndex-select-${roundNumber}-${i}" class="form-control">
            <option>none</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
          <h5 data-localize="bet-question">Bet question</h5>
          <select id="betIndex-select-${roundNumber}-${i}" class="form-control">
            <option>none</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
          ${questionList(roundNumber, i)}
        </div>
        <br>
    `).join('\n');
  }

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
      <h2 class="collapse-control" id="ref_round1"><span class="collapse-control" id="ref2_round1" data-localize="round">Round</span> 1 ➔</h2>
      <div class="collapse" id="round1">
        ${themesList(1)}
      </div>
     <h2 class="collapse-control" id="ref_round2"><span class="collapse-control" id="ref2_round2" data-localize="round">Round</span> 2 ➔</h2>
      <div class="collapse" id="round2">
        ${themesList(2)}
      </div>
      <h2 class="collapse-control" id="ref_round3"><span class="collapse-control" id="ref2_round3" data-localize="round">Round</span> 3 ➔</h2>
      <div class="collapse" id="round3">
        ${themesList(3)}
      </div>
      <h2 class="collapse-control" id="ref_round-fin"><span data-localize="final-round" class="collapse-control" id="ref2_round-fin">Final Round</span> ➔</h2>
      <div class="collapse" id="round-fin">
        ${finalQuestionList()}
      </div>

      <button id="submitBundleEditor-btn" type="button" class="btn dark-b-hover btn-lg btn-block" style="margin-top: 40px" data-localize="bundle">Create bundle</button>
      <div style="height: 40px">      
    </form>
  </div>
  `;
};

export default view;
