'use strict';

import { changeHash } from '../spaControl.js';
import Language from '../../changeLanguage.js';

export default class StaticElementsController {

  clickConfig = {
    'help': [changeHash('help')],
    'home': [changeHash('chooseMode')],
    'dju': [changeHash('')],
    'de': [() => this.changeLanguage('de')],
    'ua': [() => this.changeLanguage('ua')],
    'close-popup': [this.closeCustomPopup],
  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  changeLanguage(langcode) {
    const language = Language.getLanguage(langcode);
    if (language) Language.changeLanguage(language);
  }

  closeCustomPopup() {
    document.getElementById('popupPlaceholder').innerHTML = '';
  }
}