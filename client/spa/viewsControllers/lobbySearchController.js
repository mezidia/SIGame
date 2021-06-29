'use strict';
import { sortGames, takeName } from './externalControlersFunctions.js';

export default class LobbySearchController {

  changeConfig = {
    'select-games-by-type': [sortGames],

  }

  inputConfig = {
    'find-games': [sortGames],

  }

  clickConfig = {
    'username-taken': [onUserNameTaken],

  }

  getHandlers(evt) {
    const configString = evt.type + 'Config';
    console.log(configString);
    if (!this[configString]) return false;
    if (!this[configString][evt.target.id]) return false;
    return this[configString][evt.target.id];
  }

  onUserNameTaken () {
    document.getElementById('username-taken').style.display = 'none';
    document.getElementById('close-popup').style.display = 'none';
    const div = document.getElementsByClassName('custom-popup')[0];
    const input = `<input id="name-input" type="text" placeholder="Enter your name" pattern="[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+" title="May contain letters and/or numbers only" maxlength=34 style="min-height: 50px" data-localize="name" required>`;
    const okButton = document.createElement('button');
    okButton.setAttribute('class', 'btn btn-primary');
    okButton.style.width = '50%';
    okButton.style.margin = '10px';
    okButton.innerText = 'OK';
    okButton.addEventListener('click', () => {
      const name = takeName()
      console.log('okButton ' + takeName());
      if (takeName() === null) return;
      new User().setName(name);
      storage.socket.send(JSON.stringify({mType: 'sendName', data: {name: name}}));
      closeCustomPopup();
    })
    div.innerHTML += input;
    div.appendChild(okButton);
    document.getElementById('name-input').value = window.localStorage.getItem('name');
  }

  closeCustomPopup() {
    document.getElementById('popupPlaceholder').innerHTML = '';
  }

}
