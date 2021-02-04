'use strict';

//this function changes language according to json files
function changeLanguage(lang) {
  const allText = document.querySelectorAll('[data-localize]');
  for (let el of allText) {
    if (el.attributes.placeholder) {
      el.placeholder = lang[el.attributes['data-localize'].textContent].placeholder;
    }
    if (el.attributes.title) {
      el.title = lang[el.attributes['data-localize'].textContent].title;
    }
    el.textContent = lang[el.attributes['data-localize'].textContent];
  }
}

export { changeLanguage };
