'use strict';

//start with default language
import { de } from '../localization/de.js';
import { ua } from '../localization/ua.js';
export default class Language {
  static _language = {json: de};
  static _languages = { de: de, ua: ua}; 

  static getTranslatedText(text) {
    return this._language.json[text];
  }

  static getLanguage(langcode) {
    if (langcode in this._languages) return this._languages[langcode];
    else return null;
  }

  //this function changes language according to json files and data-localize attribute
  static changeLanguage = (lang = null) => {
    const allText = document.querySelectorAll('[data-localize]');
    if (!lang) lang = this._language.json;
    else this._language.json = lang;
    const localStorage = window.localStorage;
    localStorage.setItem('language', lang.code);
    for (let el of allText) {
      const dataLocal = el.attributes['data-localize'].textContent;
      if (el.attributes.placeholder) {
        el.placeholder = lang[dataLocal].placeholder;
      }
      if (el.attributes.title) {
        el.title = lang[dataLocal].title;
      }
      if (lang[dataLocal]) el.textContent = lang[dataLocal];
    }
  }
}
