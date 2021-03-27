'use strict';

const errPopup = text => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div class="custom-popup err-popup">
     <div style="grid-row: 1 / 2; grid-column: 1 / 2">
        <h1 style="text-align: center">Error</h1>
     </div>
     <div>
       <p>${text}</p>
       <button class="btn btn-primary" style="width: 100%; text-align: center" id="close-popup">OK</button>
    </div>
  </div>
  `;
}

const leavePopup = text => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div class="custom-popup">
    <h1>${text}</h1>
    <button class="btn btn-primary" style="width: 50%; text-align: center; float: left" id="exit-game-btn">Yes</button>
    <button class="btn btn-primary" style="width: 50%; text-align: center" id="close-popup">No</button>
  </div>
  `;
}

const appealPopup = obj => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div class="custom-popup">
    <h1>${obj.question}</h1>
    <p>${obj.author} answered: ${obj.answer}</p>
    <p>Is the answer correct?</p>
    <button class="btn btn-primary" style="width: 50%; text-align: center; float: left" id="appeal-true">Yes</button>
    <button class="btn btn-primary" style="width: 50%; text-align: center;" id="close-popup">No</button>
  </div>
  `;
}

export {
  errPopup,
  leavePopup,
  appealPopup
}
