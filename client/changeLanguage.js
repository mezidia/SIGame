'use strict';

//start with default language
import { de } from '../localization/de.js'
let language = { json: de };

//this function changes language according to json files and data-localize attribute
const changeLanguage = (lang = null) => () => {
  const allText = document.querySelectorAll('[data-localize]');
  if (!lang) lang = language.json;
  else language.json = lang;
  const localStorage = window.localStorage;
  localStorage.setItem('language', lang.code);
  console.log(localStorage.getItem('language'));
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

export { changeLanguage, language };
