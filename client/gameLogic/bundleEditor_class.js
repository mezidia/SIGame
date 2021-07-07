'use strict';

import Bundle from './bundle_class.js';
import Deck from './deck_class.js';
import Question from './question_class.js';
import User from './user_class.js';
import { getRandomIntInclusive } from '../utils.js';
import { storage } from '../main.js';
import { errPopup } from '../spa/uiElements.js';

const reg = /[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+/; 
const MB = 1024**2;

function inputFileToBlob(file) {
  return new Promise((resolve, reject) => {
    const f = new FileReader();
    f.onload = evt => resolve(evt.target.result);
    f.readAsDataURL(file);
  });
}

function isAcceptableSize(file, maxSizeMB = 10) {
  if (!file.size) throw new Error('Invalid file: has not size property!');
  const fileSizeMB = Math.ceil(file.size / MB);
  return fileSizeMB < maxSizeMB;
}

async function getQData(r, c, q) {
  const string = document.getElementById(`question-${r}-${c}-${q}`).value;
  const audioFile = document.getElementById(`audio-${r}-${c}-${q}`).files[0];
  const imgFile = document.getElementById(`img-${r}-${c}-${q}`).files[0];
  const trueAns = document.getElementById(`answer-${r}-${c}-${q}`).value;
  const falseAns = document.getElementById(`wrong-answer-${r}-${c}-${q}`).value;
  if (!reg.test(string)) return false;
  if (!reg.test(trueAns)) return false;
  if (falseAns.length > 0) if (!reg.test(falseAns)) return false;
  let audioBlob = null;
  let imgBlob = null;
  if (audioFile) {
    if (isAcceptableSize(audioFile)) {
      await inputFileToBlob(audioFile)
      .then(blob => {
        audioBlob = blob;
      }, err => {
        console.error(err);
        return false;
      });
    } else {
      //popup max size = 10mb!
      return false;
    }
  } else if (imgFile) {
    if (isAcceptableSize(imgFile)) {
      await inputFileToBlob(imgFile)
      .then(blob => {
        imgBlob = blob;
      }, err => {
        console.error(err);
        return false;
      });
    } else {
      //popup max size = 10mb!
      return false;
    }
  }
  return { string, trueAns, falseAns, audio: audioBlob, img: imgBlob };
}

function getDomElemVal(elem) {
  const val = elem.value;
  if (!reg.test(val)) {
    throw new Error(`failed reg test on ${elem.id}`);
  }
  return val;
}

function getSpecialQIndex(r, c) {
  const secretIndex = document.getElementById(`secretIndex-select-${r}-${c}`).value;
  const betIndex = document.getElementById(`betIndex-select-${r}-${c}`).value;
  return { secretIndex, betIndex };
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
    console.log(allBundles, bundlesByLang);
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

  async submitBundleEditor() {
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
            const qData = await getQData(r, c, q);
            if (!qData) {
              errPopup('invalid', 'popupPlaceholder', ` ${r}-${c}-${q}`);
              return false;
            }
            const qstn = new Question(qData); // submiting 3 rounds
            qstn.type = 'regular';
            deck.questions.push(qstn);
          }
          const { secretIndex: secret, betIndex: bet } = getSpecialQIndex(r, c);
          if (secret !== 'none') deck.questions[secret - 1].type = 'secret';
          if (bet !== 'none') deck.questions[bet - 1].type = 'bet';
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
        const qData = await getQData(4, 1, q);
        if (!qData) {
          errPopup('invalid', 'popupPlaceholder', ` final-${q}`);
          return false;
        }
          const qstn = new Question(qData);
        qstn.type = 'final';
        deck.questions.push(qstn); //final questione
        bundleData.decks.push(new Deck(deck));
      } 
    } catch (err) {
      console.log(err);
      return false;
    }
    console.log(bundleData);
    if (iSBundleToSave) {
      const msg = {
        'mType': 'saveBundleToDB',
        data: bundleData,
      };
      storage.socket.send(JSON.stringify(msg, null, '\t'));
    }
    downloadAsFile(JSON.stringify(new Bundle(bundleData), null, '\t'));
    return true;
  }

  getBundlesByLangcode(bundles, code) {
    return bundles.filter(b => b.langcode === code);
  }
  
}
