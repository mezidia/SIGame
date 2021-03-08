'use strict';

import RenderEngine from './engine.js';
import Router from './router.js';
import { changeLanguage } from '../changeLanguage.js';

const router = new Router();
const engine = new RenderEngine();

async function loadMainView() {
  const view = await import('./views/mainPage.js');
  engine.render(view.default);
}

const changeHash = (hash) => async() => {
  router.change(hash);
  await loadView();
};

const getHash = () => router.getHash()

const loadView = async () => {
  const { viewName } = router.getState();
  engine.loader();
  await import(`./views/${viewName}.js`)
    .then((viewModel) => {      
      engine.render(viewModel.default);
    })
    .catch(reason => {
      console.log(reason);
      loadMainView();
    })
    .catch(reason => {
      console.log(reason);
    })
    .finally(changeLanguage());
};

const checkView = () => {
  const { viewName } = router.getState();
  return viewName;
}

export {
  loadView,
  changeHash,
  checkView,
  loadMainView,
  getHash,
};
