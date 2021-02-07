const view = () => {
  const questionList = (roundNumber, themeNumber) => {
    return [1, 2, 3, 4, 5].map(i => `
      <h5>Question ${i}: ${i*roundNumber}00 points</h5>
      <input type="text" placeholder="Question" id="question-${roundNumber}-${themeNumber}-${i}" required>
      <input type="text" placeholder="Answers" id="answer-${roundNumber}-${themeNumber}-${i}" required>
      <input type="text" placeholder="Wrong answers(optional)" id="wrong-answer-${roundNumber}-${themeNumber}-${i}">`).join('\n');
  }
  const finalQuestionList = () => {
    return [1, 2, 3, 4, 5, 6, 7].map(i => `
      <h5>Question ${i}</h5>
      <input type="text" placeholder="Category" id="final-theme-${i}">  
      <br>
      <br>    
      <input type="text" placeholder="Question" id="question-4-1-${i}">
      <input type="text" placeholder="Answers" id="answer-4-1-${i}">
      <input type="text" placeholder="Wrong answers(optional)" id="wrong-answer-4-1-${i}">`).join('\n');
  }

  const themesList = roundNumber => {
    return [1, 2, 3, 4, 5].map(i => `
        <h3>Category ${i}</h3>
        <div class="collapse show">
          <h4>Category name: </h4>
          <input type="text" id="category-name-${roundNumber}-${i}">
          ${questionList(roundNumber, i)}
        </div>
        <br>
    `).join('\n');
  }

  return `<div class="container">
    <form>
      <h2>Pack title:</h2>
      <input type="text">
      <h2>Author:</h2>
      <input type="text">
      <h2>Language:</h2>
      <select class="form-control">
        <option>German</option>
        <option>Ukrainian</option>
      </select>
      <h2>Mode:</h2>
      <select class="form-control">
        <option>Classic</option>
        <option>Simplified</option>
      </select>
      
      <br>
      <h2>Round 1</h2>
      <div class="collapse show">
        ${themesList(1)}
      </div>
     <h2>Round 2</h2>
      <div class="collapse show">
        ${themesList(2)}
      </div>
      <h2>Round 3</h2>
      <div class="collapse show">
        ${themesList(3)}
      </div>
      <h2>Final Round</h2>
      <div class="collapse show">
        ${finalQuestionList()}
      </div>

      <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-top: 40px">Create pack</button>
      <div style="height: 40px">      
    </form>
  </div>
  `;
};

export default view;
