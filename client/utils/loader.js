'use strict';

export const loader = () => {
    document.getElementById('main').innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-primary" role="status" style="width: 5rem; height: 5rem;">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    `;
}
