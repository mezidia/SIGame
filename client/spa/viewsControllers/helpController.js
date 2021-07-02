'use strict';

import { scrollToRef } from './externalControlersFunctions.js';

export default class HelpController {

  clickConfig(evt, elementId) {
    return {
    'ref_help-rules': [scrollToRef('ref_help-rules')],
    'ref_help-questions': [scrollToRef('ref_help-questions')],
    'ref_help-bug': [scrollToRef('ref_help-bug')],
    'go-up-btn': [this.scrollToStart],
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

  scrollToStart() {
    window.scrollTo(0, 0)
  }


}