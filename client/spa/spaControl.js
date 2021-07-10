'use strict';

import * as controllers from './viewsControllers/indexControllers.js';
import RenderEngine from './engine.js';
import Router from './router.js';
import Language from '../language.js';
import { yesnoPopup } from './uiElements.js';
import { storage } from '../main.js';

const page = {next: ''};

const router = new Router();
const engine = new RenderEngine();

async function loadMainView() {
  const view = await import('./views/mainPage.js');
  engine.render(view.default);
}

const getHash = () => router.getHash();

const changeHash = hash => async () => {
  let ask = false;
  if (router.getHash()) {
    const parts = router.getHash().split('/');
    let hash1 = parts[0];
    if (hash1 === 'simpleLobby' && hash !== '') {
      ask = true;
    }
  }
  
  if(ask) {
    page.next = hash;
    yesnoPopup('onleave');
    return;
  }

  router.change(hash);
  if (!storage.socket && hash !== 'chooseMode' && hash !== 'help') router.change('mainPage');
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
    .finally(() => {
      if (viewName === 'mainPage') {
        const name = window.localStorage.getItem('name');
        if (name) document.getElementById('name-input').value = name;
      }
      const langcode = window.localStorage.getItem('language');
      const language = Language.getLanguage(langcode);
      if (language) Language.changeLanguage(language);
    });
};

const getViewControllerClassName = () => {
  let currrentView = checkView();
  currrentView = currrentView.charAt(0).toUpperCase() + currrentView.slice(1)
  const controllerName = currrentView + 'Controller';
  return controllerName;
}

const checkView = () => {
  const { viewName } = router.getState();
  return viewName;
}

const сontrollersConfig = Object.fromEntries(Object.entries(controllers));

const getController = (name = undefined) => {
  return new (сontrollersConfig[name || getViewControllerClassName()]);
}

export {
  loadView,
  changeHash,
  checkView,
  loadMainView,
  getHash,
  getViewControllerClassName,
  сontrollersConfig,
  getController,
  page,
};
