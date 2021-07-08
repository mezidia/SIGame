'use strict';

import Language from "../changeLanguage.js"

const errPopup = (id, placeholderId = 'popupPlaceholder', addInfo = '') => {
  const placeholder = document.getElementById(placeholderId);
  placeholder.innerHTML = `<div id="gray-space"></div>
  <div class="custom-popup err-popup">
     <div style="grid-row: 1 / 2; grid-column: 1 / 2">
        <h1 style="text-align: center">Error</h1>
     </div>
     <div>
       <p><span id="custom-err-popup-text-id" data-localize="${id}">${Language.getTranslatedText(id)}</span>${addInfo}</p>
       <button class="btn dark-b-hover" style="width: 100%; text-align: center" id="close-popup">OK</button>
    </div>
  </div>
  `;
}

const yesnoPopup = id => {
  const placeholder = document.getElementById('popupPlaceholder');
  placeholder.innerHTML = `<div id="gray-space"></div>
  <div class="custom-popup">
    <h1 id="custom-leave-popup-text">${Language.getTranslatedText(id)}</h1>
    <button class="btn dark-r-hover" style="width: 50%; text-align: center; float: left" id="${id}" data-localize="yes">${Language.getTranslatedText('yes')}</button>
    <button class="btn dark-b-hover" style="width: 50%; text-align: center" id="close-popup" data-localize="no">${Language.getTranslatedText('no')}</button>
  </div>
  `;
}

export {
  errPopup,
  yesnoPopup,
}
