'use strict';

const errPopup = text => {
  const placeholder = document.getElementById('popupPlaceholder')
  placeholder.innerHTML = `<div class="err-popup">
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
