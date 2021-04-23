'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js';
import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';

const bundleEditor = new BundleEditor();

export default class RedactorController {

  clickConfig = {
    'submitBundleEditor-btn': [bundleEditor.submitBundleEditor, changeHash('')],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

}

