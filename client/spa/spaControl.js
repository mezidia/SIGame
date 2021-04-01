'use strict';

import RenderEngine from './engine.js';
import Router from './router.js';
import { changeLanguage, language } from '../changeLanguage.js';
import { leavePopup } from './uiElements.js';

import { de } from '../../localization/de.js';
import { ua } from '../../localization/ua.js';
const languages = {
  de: de,
  ua: ua
}

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
    leavePopup(language.json['onleave']);
    return;
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
    .finally(() => {
      console.log(viewName);
      if (viewName === 'mainPage') {
        const name = window.localStorage.getItem('name');
        if (name) document.getElementById('name-input').value = name;
      }
      const langcode = window.localStorage.getItem('language');
      if (langcode) changeLanguage(languages[langcode])();
    });
};

const getViewControllerClassName = () => {
  let currrentView = checkView();
  currrentView = currrentView.charAt(0).toUpperCase() + currrentView.slice(1)
  const controllerName = currrentView + 'Controller';
  console.log(controllerName);
  return controllerName;
}

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
  getViewControllerClassName,
};
