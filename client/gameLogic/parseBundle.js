'use strict';

import Bundle from "./bundle_class.js";
import Deck from "./deck_class.js";
import Question from "./question_class.js";

export default function parseBundle(obj) {
  const bundle = obj.bundle;
  const res = [];
  for (const deck of bundle) {
    const questions = [];
    for (const q of deck.questions) {
      questions.push(new Question(q));
    }
    deck.questions = questions;
    res.push(new Deck(deck));
  }
  const bundleData = { 
    decks: res,
  };
  return new Bundle(bundleData);
}
