'use strict';

import { language } from "../changeLanguage.js"

const errPopup = text => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div class="custom-popup err-popup">
     <div style="grid-row: 1 / 2; grid-column: 1 / 2">
        <h1 style="text-align: center">Error</h1>
     </div>
     <div>
       <p id="custon-err-popup-text-id">${text}</p>
       <button class="btn btn-primary" style="width: 100%; text-align: center" id="close-popup">OK</button>
    </div>
  </div>
  `;
}

const leavePopup = text => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div class="custom-popup">
    <h1 id="custom-leave-popup-text">${text}</h1>
    <button class="btn btn-primary" style="width: 50%; text-align: center; float: left" id="exit-game-btn" data-localize="yes">${language.json['yes']}</button>
    <button class="btn btn-primary" style="width: 50%; text-align: center" id="close-popup" data-localize="no">${language.json['no']}</button>
  </div>
  `;
}

export {
  errPopup,
  leavePopup,
}
