'use strict';

import Question from "./question_class.js";

function getQData(r, c, q) {
  const string = document.getElementById(`question-${r}-${c}-${q}`).value;
  const trueAns = document.getElementById(`answer-${r}-${c}-${q}`).value;
  const falseAns = document.getElementById(`wrong-answer-${r}-${c}-${q}`).value;
  const qType = document.getElementById(`question-type-${r}-${c}-${q}`).value
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  if (!reg.test(qstn) && !reg.test(ans) && !reg.test(falseAns)) {
    throw new Error(`failed reg test on ${r}-${c}-${q}`);
  }
  return {qstn, ans, qType, falseAns, 'cost': q * 100, type: 'regular'};
}

function getMainFields() {
  const bundleAuthorInput = document.getElementById('bundleAuthor-input');
  const bundleTitleInput = document.getElementById('bundleTitle-input');
  const bundleLangSelect = document.getElementById('bundleLang-select');
  const bundleModeSelect = document.getElementById('bundleGameMode-select');
  const mainBundleFields = [
    bundleAuthorInput, 
    bundleTitleInput,
    bundleLangSelect, 
    bundleModeSelect,
  ];
  for (const domElem of mainBundleFields) {
    try {
      domElem = getDomElemVal(domElem); 
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  /*mainBundleFields.forEach((elem) => {
    console.log(elem);
    elem = getDomElemVal(elem);
  }); */
  return mainBundleFields;
}

function getDomElemVal(elem) {
  const val = elem.value;
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  if (!reg.test(val)) {
    throw new Error(`failed reg test on ${elem.id}`);
  }
  return val;
}

let text = JSON.stringify({hello: 'example'});

function downloadAsFile(data) {
  let a = document.createElement('a');
  let file = new Blob([data], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = 'bundle.json';
  a.click();
}

export default function getBundleEditorData() {
  const mainBundleFields = getMainFields();
  console.log(mainBundleFields);
  if (!mainBundleFields) return false;
  const bundleData = {};
  for (let r = 1; r < 4; r++) { //round
    for (let c = 1; c <= 5; c++) { //category
      const sbjInput = document.getElementById('category-name-${r}-${c}');
      const subject = getDomElemVal(sbjInput);
      const deck = {
        subject,
        questions: [],
      }
      for(let q = 1; q <= 5; q++) { //question
        try {
          const q = new Question (getQData(r, c, q)); // submiting 3 rounds
        } catch (err) {
          console.log(err);
          return false;
        }
      }
      bundleData
    }
  }
  for (let q = 1; q <= 7; q++) {
    try {
      getQData(4, 1, q); //final questione
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  downloadAsFile(text);
}
