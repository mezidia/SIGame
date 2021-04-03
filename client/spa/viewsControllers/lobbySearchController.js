'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js';
import { storage } from '../../main.js';
import { changeHash } from '../spaControl.js';

const bundleEditor = new BundleEditor();

export default class LobbySearchController {

  clickConfig = {
    'submitBundleEditor-btn': [bundleEditor.submitBundleEditor, changeHash('')],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    return this[configString][evt.target.id];
  }

}
