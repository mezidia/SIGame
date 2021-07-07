'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js'
import { changeHash } from '../spaControl.js';
import { scrollToRef } from './externalControlersFunctions.js';

const bundleEditor = new BundleEditor();

export default class RedactorController {

  clickConfig(evt, elementId) {
    return {
      'submitBundleEditor-btn': [() => bundleEditor.submitBundleEditor().then(success => {
        if (success) {
          changeHash('')();
        }
      })],
      'scroll-to': [scrollToRef(evt.target.id)],
      'scroll-direct': [evt.target.scrollIntoView],
      'collapse-control': [this.collapseControl(evt.target.id)],  
    }[elementId];
  }

  changeConfig(evt, elementId) {
    return {
      'exclude': [() => this.delAlternative(evt.target.id)],
    }[elementId]
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

  imgAud(str) {
    return str === 'img' ? 'audio_cont' : 'img_cont';
  }

  delAlternative(id) {
    const temp = id.split('-');
    const dom = temp.shift();
    document.getElementById(this.imgAud(dom) + '-' + temp.join('-')).style.display = 'none';
  }

  collapseControl(id) {
    return () => {
      const target = document.getElementById(id.split('_')[1]);
      if(target.classList.contains('show')) {
        target.classList.remove('show');
      } else {
        target.classList.add('show');
      }
    }
  }

}


