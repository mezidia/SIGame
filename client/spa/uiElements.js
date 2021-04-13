'use strict';

import { language } from "../changeLanguage.js"

const errPopup = id => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div class="custom-popup err-popup">
     <div style="grid-row: 1 / 2; grid-column: 1 / 2">
        <h1 style="text-align: center">Error</h1>
     </div>
     <div>
       <p id="custom-err-popup-text-id" data-localize="${id}">${language.json[id]}</p>
       <button class="btn btn-primary" style="width: 100%; text-align: center" id="close-popup">OK</button>
    </div>
  </div>
  `;
}

const yesnoPopup = id => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div class="custom-popup">
    <h1 id="custom-leave-popup-text">${language.json[id]}</h1>
    <button class="btn btn-primary" style="width: 50%; text-align: center; float: left" id="${id}" data-localize="yes">${language.json['yes']}</button>
    <button class="btn btn-primary" style="width: 50%; text-align: center" id="close-popup" data-localize="no">${language.json['no']}</button>
  </div>
  `;
}

export {
  errPopup,
  yesnoPopup,
}
