'use strict';

import BundleEditor from '../../gameLogic/bundleEditor_class.js'
import { changeHash } from '../spaControl.js';
import { scrollToRef } from './externalControlersFunctions.js';
import {errPopup} from '../uiElements.js';

const bundleEditor = new BundleEditor();

export default class RedactorController {

  clickConfig(evt, elementId) {
    return {
      'submitBundleEditor-btn': [() => bundleEditor.submitBundleEditor().then(success => {
        if (success) {
          changeHash('')();
        }
      })],
      'submit-size': [this.submitSizes],
      'scroll-to': [scrollToRef(evt.target.id)],
      'scroll-direct': [evt.target.scrollIntoView],
      'collapse-control': [this.collapseControl(evt.target.id)],  
    }[elementId];
  }

  changeConfig(evt, elementId) {
    return {
      'exclude': [() => this.delAlternative(evt.target.id)],
    }[elementId]
  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    if (!this[configString]) return false;
    let handlers = this[configString](evt, evt.target.id);
    if (!handlers) {
      handlers = this[configString](evt, evt.target.classList[0]);
    }
    if (!handlers) return false;
    return handlers;
  }

  questionList(roundNumber, themeNumber, questionCount = 5) {
    return Array(questionCount).fill(1).map((x, i) => i + 1).map(i => `
      <h5><span data-localize="question">Question</span> ${i}: ${i*roundNumber}00 <span data-localize="points">points</span></h5>
      <p data-localize="sep-answers">Separate true and wrong answers via comas</p>
      <input type="text" placeholder="Question" maxlength=200 id="question-${roundNumber}-${themeNumber}-${i}" data-localize="input-question" required>
      <input type="text" placeholder="Answers" maxlength=300 id="answer-${roundNumber}-${themeNumber}-${i}" data-localize="answers" required>
      <input type="text" placeholder="Wrong answers(optional)" maxlength=300 id="wrong-answer-${roundNumber}-${themeNumber}-${i}" data-localize="wrong-answers-input">
      <input type="number" placeholder="Question price(optional)" id="question-cost-${roundNumber}-${themeNumber}-${i}" data-localize="question-price">      
      <h5 data-localize="optional">Optional</h5>
      <div id="audio_cont-${roundNumber}-${themeNumber}-${i}">
        <label for="audio" data-localize="input-audio">Select audio for a question</label>
        <input type="file" class="exclude" id="audio-${roundNumber}-${themeNumber}-${i}" name="audio" accept=".mp3,.ogg">
      </div>
      <div id="img_cont-${roundNumber}-${themeNumber}-${i}">
        <label for="image" data-localize="input-image">Select image for a question</label>
        <input type="file" class="exclude" id="img-${roundNumber}-${themeNumber}-${i}" name="image" accept=".jpeg,.jpg,.png">
      </div>
      `).join('\n');
  }

  finalQuestionList(questionCount = 7, roundCount = 3) {
    return Array(questionCount).fill(1).map((x, i) => i + 1).map(i => `
      <h5 data-localize="question">Question ${i}</h5>
      <input type="text" placeholder="Category" id="final-theme-${i}" data-localize="input-category" required>  
      <br>
      <br>
      <input type="text" placeholder="Question" maxlength=200 id="question-${roundCount + 1}-1-${i}" data-localize="input-question" required>
      <input type="text" placeholder="Answers" maxlength=300 id="answer-${roundCount + 1}-1-${i}" data-localize="answers" required>
      <input type="text" placeholder="Wrong answers(optional)" maxlength=300 id="wrong-answer-${roundCount + 1}-1-${i}" data-localize="wrong-answers-input">
      <input type="text" placeholder="Question type" id="question-type-${roundCount + 1}-1-${i}" data-localize="question-type" required>
      <input type="number" placeholder="Question price(optional)" id="question-cost-${roundCount + 1}-1-${i}" data-localize="question-price">      
      <h5 data-localize="optional">Optional</h5>
      <div id="audio_cont-${roundCount + 1}-1-${i}">
        <label for="audio" data-localize="input-audio">Select audio for a question</label>
        <input type="file" class="exclude" id="audio-${roundCount + 1}-1-${i}" name="audio" accept=".mp3,.ogg">
      </div>
      <div id="img_cont-${roundCount + 1}-1-${i}">
        <label for="image" data-localize="input-audio">Select image for a question</label>
        <input type="file" class="exclude" id="img-${roundCount + 1}-1-${i}" name="image" accept=".jpeg,.jpg,.png">
      </div>`).join('\n');
  }

  themesList(roundNumber, themeCount = 5, questionCount = 5) {
    return Array(themeCount).fill(1).map((x, i) => i + 1).map(i => `
        <h3><span data-localize="category">Category</span> ${i}</h3>
        <div class="collapse show">
          <h4 data-localize="category-name">Category name</h4>
          <input type="text" maxlength=200 id="category-name-${roundNumber}-${i}" required>
      
          <h5 data-localize="secret-question">Secret question</h5>
          <select id="secretIndex-select-${roundNumber}-${i}" class="form-control">
            <option>none</option>
            ${Array(questionCount).fill(1).map((x, i) => i + 1).map(i => `<option>${i}</option>`).join('\n')}
          </select>
          <h5 data-localize="bet-question">Bet question</h5>
          <select id="betIndex-select-${roundNumber}-${i}" class="form-control">
            <option>none</option>
            ${Array(questionCount).fill(1).map((x, i) => i + 1).map(i => `<option>${i}</option>`).join('\n')}
          </select>
          ${this.questionList(roundNumber, i, questionCount)}
        </div>
        <br>
    `).join('\n');
  }

  roundList(roundCount = 3, themeCount = 5, questionCount = 5, finQuestionCount = 7) {
    document.getElementById('rounds').innerHTML = Array(roundCount).fill(1).map((x, i) => i + 1)
      .map(i => `<h2 class="collapse-control" id="ref_round${i}"><span class="collapse-control" id="ref2_round${i}" data-localize="round">Round</span> ${i} ➔</h2>
      <div class="collapse" id="round${i}">
        ${this.themesList(i, themeCount, questionCount)}
      </div>`).concat(`
      <h2 class="collapse-control" id="ref_round-fin"><span data-localize="final-round" class="collapse-control" id="ref2_round-fin">Final Round</span> ➔</h2>
      <div class="collapse" id="round-fin">
        ${this.finalQuestionList(finQuestionCount, roundCount)}
      </div>`).concat(`
      <button id="submitBundleEditor-btn" type="button" class="btn dark-b-hover btn-lg btn-block" style="margin-top: 40px" data-localize="bundle">
        Create bundle
      </button>`)
      .join('\n');
  }

  validateSize(num, lower, high, name) {
    if (num < lower || num > high) {
      errPopup(`wrong-${name}`, 'popupPlaceholder', ` ${lower}-${high}`)
      return false;
    }
    return true;
  }

  validateForm(roundNum, themeNum, questionsNum, finQuestionsNum) {
    return [this.validateSize(roundNum, 1, 3, 'round'), // 1 to 3 rounds
      this.validateSize(themeNum, 2, 5, 'theme'), // 2 to 5 themes
      this.validateSize(questionsNum, 2, 5, 'question'),  // 2 to 5 questions
      this.validateSize(finQuestionsNum, 2, 7, 'f-question'), // 2 to 7 final questions
    ].every(x => x)
  }

  submitSizes = () => {
    const roundNum = +document.getElementById('round-num').value;
    const themeNum = +document.getElementById('theme-num').value;
    const questionNum = +document.getElementById('question-num').value;
    const finQuestionNum = +document.getElementById('fin-question-num').value;
    if (!this.validateForm(roundNum, themeNum, questionNum, finQuestionNum)) return;
    bundleEditor.setBundleSize(roundNum, themeNum, questionNum, finQuestionNum);
    this.roundList(roundNum, themeNum, questionNum, finQuestionNum);
  }

  imgAud(str) {
    return str === 'img' ? 'audio_cont' : 'img_cont';
  }

  delAlternative(id) {
    const temp = id.split('-');
    const dom = temp.shift();
    document.getElementById(this.imgAud(dom) + '-' + temp.join('-')).style.display = 'none';
  }

  collapseControl(id) {
    return () => {
      const target = document.getElementById(id.split('_')[1]);
      if(target.classList.contains('show')) {
        target.classList.remove('show');
      } else {
        target.classList.add('show');
      }
    }
  }

}


