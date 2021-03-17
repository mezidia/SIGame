'use strict';

import Bundle from "./bundle_class.js";
import Deck from "./deck_class.js";
import Question from "./question_class.js";
import User from "./user_class.js";
import { getRandomIntInclusive } from '../utils.js';

function getQData(r, c, q) {
  const string = document.getElementById(`question-${r}-${c}-${q}`).value;
  const trueAns = document.getElementById(`answer-${r}-${c}-${q}`).value;
  const falseAns = document.getElementById(`wrong-answer-${r}-${c}-${q}`).value;
  const type = document.getElementById(`question-type-${r}-${c}-${q}`).value
  const reg = /[A-Za-zА-яҐґЇїІі0-9']+/;
  if (!reg.test(string)) throw new Error(`failed reg test on string ${r}-${c}-${q}`);
  if (!reg.test(trueAns)) throw new Error(`failed reg test on trueAns ${r}-${c}-${q}`);
  if (falseAns.length > 0) if (!reg.test(falseAns)) throw new Error(`failed reg test on falseAns ${r}-${c}-${q}`);
  if (!reg.test(type)) throw new Error(`failed reg test on type ${r}-${c}-${q}`);
  return {string, trueAns, falseAns, type};
}

function getDomElemVal(elem) {
  const val = elem.value;
  const reg = /[A-Za-zА-яҐґЇїІі0-9']+/;
  if (!reg.test(val)) {
    throw new Error(`failed reg test on ${elem.id}`);
  }
  return val;
}

function toLangCode(language) {
  const lowLang = language.toLowerCase();
  const codeConfig = {
    'german': 'de',
    'ukrainian': 'ua',
  };
  const res = codeConfig[lowLang];
  if (!res) return false;
  return res;
}

function getMainFields() {
  const bundleAuthorInput = document.getElementById('bundleAuthor-input');
  const bundleTitleInput = document.getElementById('bundleTitle-input');
  const bundleLangSelect = document.getElementById('bundleLang-select');
  const mainBundleFields = [
    bundleLangSelect,
    bundleAuthorInput,
    bundleTitleInput,
  ];
  const option = bundleLangSelect.options[bundleLangSelect.selectedIndex];
  mainBundleFields[0] = option.attributes['data-localize'].textContent;
  for (let i = 1; i < mainBundleFields.length; i++) {
    try {
      mainBundleFields[i] = getDomElemVal(mainBundleFields[i]); 
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  return mainBundleFields;
}

function downloadAsFile(data) {
  let a = document.createElement('a');
  let file = new Blob([data], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = 'bundle.json';
  a.click();
}

export default class BundleEditor {
  constructor() {
    if (!BundleEditor._instance) {
      BundleEditor._instance = this;
    }
    return BundleEditor._instance;
  }

  parseBundle(obj) {
    const decks = obj.decks;
    const langcode = obj.langcode;
    const author = obj.author;
    const title = obj.title;
    const res = [];
    for (const deck of decks) {
      const questions = [];
      for (const q of deck.questions) {
        questions.push(new Question(q));
      }
      deck.questions = questions;
      res.push(new Deck(deck));
    }
    const bundleData = { 
      'decks': res,
      title,
      langcode,
      author,
      
    };
    return new Bundle(bundleData);
  }

  getRandomBundleFrom(allBundles, langcode) {
    const bundleData = {
      author: 'autogen',
      langcode: langcode,
      title: 'autogen',
      decks: [],
    };
    const bundlesByLang = this.getBundlesByLangcode(allBundles, langcode);
    // get 15 regular decks
    const usedDecksSubjects = [];
    for (let c = 0; c < 15; c++) {
      const bundle = bundlesByLang[getRandomIntInclusive(0, bundlesByLang.length - 1)];
      const allRegularDecks = bundle.getRegularDecks();
      const allRegularUnusedDecks = allRegularDecks.filter(deck => !usedDecksSubjects.includes(deck.subject));
      const deck = allRegularUnusedDecks[getRandomIntInclusive(0, allRegularUnusedDecks.length - 1)];
      if (!deck) throw Error('not enough unique decks');

       //usedDecksSubjects.push(deck.subject); !!! remove on production !!!

      bundleData.decks.push(deck);
    }
    // get 7 final decks
    usedDecksSubjects.length = 0;
    console.log(usedDecksSubjects);
    for (let c = 0; c < 7; c++) {
      const bundle = bundlesByLang[getRandomIntInclusive(0, bundlesByLang.length - 1)];
      const finalDecks = bundle.getFinalDecks();
      const uniqueFinalDecks = finalDecks.filter(deck => !usedDecksSubjects.includes(deck.subject));
      const deck = uniqueFinalDecks[getRandomIntInclusive(0, uniqueFinalDecks.length - 1)];
      if (!deck) throw Error('not enough unique decks');

      //usedDecksSubjects.push(deck.subject); !!! remove on production !!!

      bundleData.decks.push(deck);
    }
    console.log(bundleData.decks);
    return new Bundle(bundleData);
  }

  submitBundleEditor() {
    const iSBundleToSave = document.getElementById('saveBundle-checkBox').checked;
    const mainBundleFields = getMainFields();
    if (!mainBundleFields) return false;
    const bundleData = {
      decks: [],
      'langcode': undefined,
      'author': undefined,
      'title': undefined,
    };
    bundleData.langcode = toLangCode(mainBundleFields[0]);
    bundleData.author = mainBundleFields[1];
    bundleData.title = mainBundleFields[2];
    try {
      for (let r = 1; r < 4; r++) { //round
        for (let c = 1; c <= 5; c++) { //category
          const sbjInput = document.getElementById(`category-name-${r}-${c}`);
          const subject = getDomElemVal(sbjInput);
          const deck = {
            subject,
            questions: [],
          }
          for(let q = 1; q <= 5; q++) { //question
            const qstn = new Question(getQData(r, c, q)); // submiting 3 rounds
            deck.questions.push(qstn);
          }
          bundleData.decks.push(new Deck(deck));
        }
      }
      for (let q = 1; q <= 7; q++) {
        const sbjInput = document.getElementById(`final-theme-${q}`);
        const subject = getDomElemVal(sbjInput);
        const deck = {
          subject,
          questions: [],
        };
        const qstn = new Question(getQData(4, 1, q));
        deck.questions.push(qstn); //final questione
        bundleData.decks.push(new Deck(deck));
      } 
    } catch (err) {
      console.log(err);
      return false;
    }
    console.log(bundleData);
    downloadAsFile(JSON.stringify(new Bundle(bundleData), null, '\t'));
    if (iSBundleToSave) {
      const socket = new User().socket;
      const msg = {
        'mType': 'saveBundleToDB',
        data: bundleData,
      };
      socket.send(JSON.stringify(msg, null, '\t'));
    }
    return true;
  }

  getBundlesByLangcode(bundles, code) {
    return bundles.filter(b => b.langcode === code);
  }
  
}
