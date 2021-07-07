'use strict';

import { loader } from "../utils/loader.js";

export default class RenderEngine {
  render(view) {
    const root = document.getElementById('main');
    root.innerHTML = view();
  }

  loader() {
    loader();
  }
}
