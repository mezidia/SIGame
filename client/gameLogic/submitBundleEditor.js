'use strict';

const bundleAuthorInput = document.getElementById('');
const bundleTitleInput = document.getElementById('');
const bundleLangSelect = document.getElementById('');
const bundleModeSelect = document.getElementById('');

function submitQ(r, c, q) {
  const qstn = document.getElementById(`question-${r}-${c}-${q}`).value;
  const ans = document.getElementById(`answer-${r}-${c}-${q}`).value;
  const falseAns = document.getElementById(`wrong-answer-${r}-${c}-${q}`).value;
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  if (!reg.test(qstn) && !reg.test(ans) && !reg.test(falseAns)) return {r, c, q};
  console.log(qstn, ans, falseAns);
  return (qstn, ans, falseAns);
}

let text = JSON.stringify({hello: 'example'});

function downloadAsFile(data) {
  let a = document.createElement('a');
  let file = new Blob([data], {type: 'application/json'});
  a.href = URL.createObjectURL(file);
  a.download = 'bundle.json';
  a.click();
}

export default function submitBundleEditor() {
  const bundleData = {};
  for (let r = 1; r < 4; r++) { //round
    for (let c = 1; c <= 5; c++) { //category
      const cNAame = document.getElementById('category-name-${r}-${c}');
      for(let q = 1; q <= 5; q++) { //question
        submitQ(r, c, q); // submiting 3 rounds
      }
    }
  }
  for (let q = 1; q <= 7; q++) {
    submitQ(4, 1, q); //final questione
  }
  //downloadAsFile(text);
}
