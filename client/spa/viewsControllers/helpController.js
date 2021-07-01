'use strict';

import { scrollToRef } from './externalControlersFunctions.js';

export default class HelpController {

  clickConfig = {
    'ref_help-rules': [scrollToRef('ref_help-rules')],
    'ref_help-questions': [scrollToRef('ref_help-questions')],
    'ref_help-bug': [scrollToRef('ref_help-bug')],
    'go-up-btn': [this.scrollToStart],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  scrollToStart() {
    window.scrollTo(0, 0)
  }


}