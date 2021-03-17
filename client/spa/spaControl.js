'use strict';

import RenderEngine from './engine.js';
import Router from './router.js';
import { changeLanguage, language } from '../changeLanguage.js';
import { game } from '../main.js';

const router = new Router();
const engine = new RenderEngine();

async function loadMainView() {
  const view = await import('./views/mainPage.js');
  engine.render(view.default);
}

const getHash = () => router.getHash();

const changeHash = (hash) => async() => {
  let ask = false;
  if (router.getHash()) {
    const parts = router.getHash().split('/');
    let hash1 = parts[0];
    if (hash1 === 'simpleLobby' && hash !== '') {
      ask = true;
    }
  }
  
  if(ask) {
    const exit = confirm(language.json['onleave']);
    if(!exit) return;
    if(game) game.exit();
  }

  router.change(hash);
  await loadView();
};

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
