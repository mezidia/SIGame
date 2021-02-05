'use strict';

//this function changes language according to json files
function changeLanguage(lang) {
  const allText = document.querySelectorAll('[data-localize]');
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

export { changeLanguage };
