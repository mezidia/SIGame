'use strict';

import Bundle from "./bundle_class.js";
import Deck from "./deck_class.js";
import Question from "./question_class.js";


export default class BundleEditor {
  constructor() {
    if (!BundleEditor._instance) {
      BundleEditor._instance = this;
    }
    return BundleEditor._instance;
  }

  parseBundle(obj) {
    const decks = obj.decks;
    const language = obj.langcode;
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
      language,
      author,
      
    };
    return new Bundle(bundleData);
  }

  submitBundle() {

  }

  
}
