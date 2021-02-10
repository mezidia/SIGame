'use strict';

export default class RenderEngine {
  render(view) {
    const root = document.getElementById('main');
    root.innerHTML = view();
  }

  loader() {
    const root = document.getElementById('main');
    root.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-primary" role="status" style="width: 5rem; height: 5rem;">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    `;
  }
}
