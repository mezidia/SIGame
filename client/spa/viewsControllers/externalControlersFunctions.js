import { storage } from '../../main.js';
import User from '../../gameLogic/user_class.js';
import { changeHash } from '../spaControl.js';
import { yesnoPopup } from '../uiElements.js';
import Game from '../../gameLogic/game_class.js';
//import SimpleGame from '../../gameLogic/simpleGame_class.js';

const reg = /^[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+$/;

function disconnect() {
  if (storage.game) storage.game.exit();
}

function scrollToRef(id) {
  return () => {
    document.getElementById(id.split('_')[1]).scrollIntoView();
  }
}

function sortGames() {
  const input = document.getElementById('find-games').value;
  const sortParameter = document.getElementById('select-games-by-type').value;
  const games = storage.allGames.data;
  for (let i in games) {
    if (sortParameter === 'nopass') {
      if (games[i].settings.hasPassword) {
        document.getElementById(i).style.display = 'none';
        continue;
      }
    } else if (sortParameter === 'pass')  {
      if (!games[i].settings.hasPassword) {
        document.getElementById(i).style.display = 'none';
        continue;
      }
    }
    const comp = games[i].settings.roomName.substring(0, input.length);
    if (comp !== input) document.getElementById(i).style.display = 'none';
    else document.getElementById(i).style.display = 'block';
  }
}

function showGameInfoDiv() {
  document.getElementById('picture-info-2').style.display = 'block';
  document.getElementById('picture-info-1').style.display = 'none';
}

function hideGameInfoDiv() {
  document.getElementById('picture-info-2').style.display = 'none';
  document.getElementById('picture-info-1').style.display = 'block';
}

//this is handle, which is being called when join to game
async function joinHandle(gameData) {
  const gm = gameData.game;
  const gmId = gameData.id;
  if (document.getElementById('search-password')) {
    const passwordInput = document.getElementById('search-password').value;
    const passwordGame = gm.settings.password;
    if (gm.settings.hasPassword && passwordInput !== passwordGame) return;
  }
  if (gm.settings.running) return;
  if (gm.players.includes(new User().name)) {
    console.log(new User().name);
    yesnoPopup('username-taken');
    return;
  }
  if (Object.keys(gm.players).length >= gm.settings.totalPlayers) return;
  await changeHash(`simpleLobby/roomID=${gmId}`)();
  storage.socket.send(JSON.stringify({mType: 'joinGame', data: {id: gmId}}));
  storage.roomId = gmId;
  storage.game = gm.settings.gameMode === 'classic' ? new Game(gm.bundle, gm.settings, gm.players) : new SimpleGame(gm.bundle, gm.settings, gm.players);
  storage.game.setID(gmId);
  storage.game.join();
}

function gameDivOnClick(gameId, gm) {
  let gameData = null;
  storage.gameInSearchLobby = gameId;
  const searchTitle = document.getElementById('search-title');
  searchTitle.setAttribute('class', gameId);
  showGameInfoDiv();
  gameData = {game: gm, id: gameId};
  if (gm.settings.hasPassword) document.getElementById('password-to-enter').style.display = 'block';
  else document.getElementById('password-to-enter').style.display = 'none';
  document.getElementById('search-players').innerHTML = Object.keys(gm.players).length + ' / ' + gm.settings.totalPlayers;
  document.getElementById('search-title').innerHTML = gm.settings.roomName;
  document.getElementById('search-gm').innerHTML = gm.settings.master;
  document.getElementById('search-mode').innerHTML = gm.settings.gameMode;
  document.getElementById('search-question-bundle').innerHTML = gm.bundle.title;
  if (gm.settings.running) {
    document.getElementById('search-password').style.display = 'none';
    document.getElementById('game-running').style.display = 'block';
  } else {
    if(gm.settings.hasPassword) document.getElementById('search-password').style.display = 'block';
    document.getElementById('game-running').style.display = 'none';
  }
}

//function for scrolling div to end
const scrollToBottom = (e) => {
  e.scrollTop = e.scrollHeight - e.getBoundingClientRect().height;
}

//this func handles message from another member in game chat
const sendMessageToGameChat = msg => {
  const data = msg.data;
  const chatField = document.getElementById('chat');
  const message = document.createElement('div');
  message.innerHTML = `
    <p style="margin-bottom: 0">${data.name}</p>
    <div class="message">${data.message}</div>
  `;
  chatField.appendChild(message);
  scrollToBottom(chatField);
}

function takeName() {
  const name = document.getElementById('name-input').value;
  if (!reg.test(name)) return null;
  window.localStorage.setItem('name', name);
  return name;
}

//update games in lobby
function updateGames(data) {
  const games = data.data;
  const gamesSearchField = document.getElementById('games-search');
  storage.allGames = data;
  if (!gamesSearchField) return;
  gamesSearchField.innerHTML = '';
  document.getElementById('join-player').outerHTML = document.getElementById('join-player').outerHTML;
  for (const gameId in games) {
    const gm = games[gameId];
    const gameData = {game: gm, id: gameId};
    const joinGame = () => joinHandle(gameData);
    document.getElementById('join-player').addEventListener('click', joinGame);
    const gameDiv = document.createElement('div');
    gameDiv.setAttribute('id', gameId);
    gameDiv.addEventListener('click', () => gameDivOnClick(gameId, gm));
    gameDiv.innerHTML = gm.settings.roomName;
    gamesSearchField.appendChild(gameDiv);
    if (storage.gameInSearchLobby === gameId) gameDiv.click();
    else hideGameInfoDiv();
  }
  if (Object.keys(storage.allGames.data).length === 0) hideGameInfoDiv();
  sortGames();
}

//executes function returned by socketHandleConfig
function socketHandle(data, socketHandleConfig) {
  if (!socketHandleConfig(data.mType)) return;
  socketHandleConfig(data.mType)(data);
}

export {
  disconnect,
  sortGames,
  takeName,
  updateGames,
  socketHandle,
  sendMessageToGameChat,
  scrollToRef,
  
}
