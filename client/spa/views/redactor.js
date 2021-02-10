'use strict';

const view = () => {
  const questionList = (roundNumber, themeNumber) => {
    return [1, 2, 3, 4, 5].map(i => `
      <h5><span data-localize="question">Question</span> ${i}: ${i*roundNumber}00 <span data-localize="points">points</span></h5>
      <input value="final" type="text" placeholder="Question" id="question-${roundNumber}-${themeNumber}-${i}" data-localize="input-question" required>
      <input value="final" type="text" placeholder="Answers" id="answer-${roundNumber}-${themeNumber}-${i}" data-localize="answers" required>
      <input value="final" type="text" placeholder="Question type" id="question-type-${roundNumber}-${themeNumber}-${i}" data-localize="question-type" required >
      <input value="final" type="text" placeholder="Wrong answers(optional)" id="wrong-answer-${roundNumber}-${themeNumber}-${i}" data-localize="wrong-answers">`).join('\n');
  }
  const finalQuestionList = () => {
    return [1, 2, 3, 4, 5, 6, 7].map(i => `
      <h5 data-localize="question">Question ${i}</h5>
      <input value="final" type="text" placeholder="Category" id="final-theme-${i}" data-localize="input-category" required>  
      <br>
      <br>    
      <input value="final" type="text" placeholder="Question" id="question-4-1-${i}" data-localize="input-question" required>
      <input value="final" type="text" placeholder="Answers" id="answer-4-1-${i}" data-localize="answers" required>
      <input type="text" placeholder="Wrong answers(optional)" id="wrong-answer-4-1-${i}" data-localize="wrong-answers">
      <input value="final" type="text" placeholder="Question type" id="question-type-4-1-${i}" data-localize="question-type" value="final" hidden required >`).join('\n');
  }

  const themesList = roundNumber => {
    return [1, 2, 3, 4, 5].map(i => `
        <h3 data-localize="category">Category ${i}</h3>
        <div class="collapse show">
          <h4 data-localize="category-name">Category name</h4>
          <input type="text" id="category-name-${roundNumber}-${i}" required>
          ${questionList(roundNumber, i)}
        </div>
        <br>
    `).join('\n');
  }

  return `<div class="container">
    <form>
      <h2 data-localize="pack-title-word">Pack title</h2>
      <input id="bundleTitle-input" type="text" required>
      <h2 data-localize="author-word">Author</h2>
      <input id="bundleAuthor-input" type="text" required>
      <h2 data-localize="language">Language:</h2>
      <select id="bundleLang-select" class="form-control">
        <option data-localize="german">German</option>
        <option data-localize="ukrainian">Ukrainian</option>
      </select>
      <h2 data-localize="mode">Mode:</h2>
      <select id="bundleGameMode-select" class="form-control">
        <option data-localize="classic">Classic</option>
        <option data-localize="simplified">Simplified</option>
      </select>
      
      <br>
      <h2><span data-localize="round">Round</span> 1</h2>
      <div class="collapse show">
        ${themesList(1)}
      </div>
     <h2><span data-localize="round">Round</span> 2</h2>
      <div class="collapse show">
        ${themesList(2)}
      </div>
      <h2><span data-localize="round">Round</span> 3</h2>
      <div class="collapse show">
        ${themesList(3)}
      </div>
      <h2 data-localize="final-round">Final Round</h2>
      <div class="collapse show">
        ${finalQuestionList()}
      </div>

      <button id="submitBundleEditor-btn" type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top: 40px" data-localize="bundle">Create bundle</button>
      <div style="height: 40px">      
    </form>
  </div>
  `;
};

export default view;
