'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js';
import { storage } from '../../main.js';

const bundleEditor = new BundleEditor();

export default class RedactorController {

  clickConfig = {
    'submitBundleEditor-btn': [bundleEditor.submitBundleEditor, changeHash('')],

  }

  handlesConfig = {
    'click': this.clickConfig,

  }

  getHandler(evt) {
    //this.handlesConfig[evt.type]...
  }
}