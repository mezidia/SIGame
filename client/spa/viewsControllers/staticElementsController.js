'use strict';

import { changeHash } from '../spaControl.js';
import Language from '../../changeLanguage.js';

export default class StaticElementsController {

  clickConfig(evt, elementId) {
    return {
    'help': [changeHash('help')],
    'home': [changeHash('chooseMode')],
    'dju': [changeHash('')],
    'de': [() => this.changeLanguage('de')],
    'ua': [() => this.changeLanguage('ua')],
    'close-popup': [this.closeCustomPopup],
    'home-bt': [() => document.getElementsByClassName(elementId)[0].remove(), changeHash('chooseMode')],
    }[elementId];
  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    let handlers = this[configString](evt, evt.target.id);
    if (!handlers) {
      handlers = this[configString](evt, evt.target.classList[0]);
    }
    if (!handlers) return false;
    return handlers;
  }

  changeLanguage(langcode) {
    const language = Language.getLanguage(langcode);
    if (language) Language.changeLanguage(language);
  }

  closeCustomPopup() {
    document.getElementById('popupPlaceholder').innerHTML = '';
  }
}
