'use strict';
import { loadView } from './spa/spaControl.js'
import { changeLanguage } from './changeLanguage.js'
import { de } from '../localization/de.js'
import { ua } from '../localization/ua.js'

//messages from server
//client.send(JSON.stringify({mType: 'usersOnline', data: n}));
//connection.send(JSON.stringify({mType: 'uID', data: id}));

let socket = undefined;

/**
 * config function for socket msg handlers
 * @example
 * handleSocket('AAAAAAAA')
 * returns console.log
 * @returns {Function} Returns the handler of socket msg type.
*/
const handleSocket = mType => ({
  'AAAAAAAAAAAAAAAAAAA': console.log,
})[mType];

/**
 * it runs socket msg handler if it is exists
 * @example
 * msg.data.mType = 'F'
 * handleSocket(msg)
 * it runs 'F' handler from handleSocket
 * 
*/
function sockethandle(msg) {
  if (handleSocket(msg.data.mType) === undefined) {
    return;
  } else {
    handleSocket(msg.data.mType)();
  }
}

/**
 * it connect user to webSocket server,
 * setup socket msg events
 * send userName to WS server
 * 
*/
const connectToSIgame = () => {
  const reg = /[A-Za-zА-яҐґЇїІі0-9]+/;
  const name = document.getElementById('name-input').value;
  if (!reg.test(name)) return;
  socket = new WebSocket(`ws://localhost:5000?userName=${name}`);
  socket.onopen = () => {
    socket.onclose = () => {
      //disconnect();
      console.log('closed');
    };
    socket.onmessage = msg => {
      sockethandle(JSON.parse(msg.data));
      console.log(JSON.parse(msg.data));
    };
  };
};

/**
 * config function for clickes msg handlers
 * @example
 * handleClick('play-btn')
 * returns connectToSIgame
 * @returns {Function} Returns the handler of click
*/
const handleClick = evt => ({
  'play-btn': connectToSIgame,
})[evt.target.id];

/**
 * it runs click handler if it is exists
 * @example
 * evt.target.id = 'play-btn'
 * handleClick(evt)
 * it runs 'play-btn' handler from handleClick
 * 
*/
document.addEventListener('click', evt => {
  if (handleClick(evt) === undefined) {
    return;
  } else {
    handleClick(evt)();
  }
});

//put listeners on language change
const deEl = document.getElementById('de');
const uaEl = document.getElementById('ua');
uaEl.addEventListener('click', () => changeLanguage(ua));
deEl.addEventListener('click', () => changeLanguage(de));

/**
 * 1 - it opens main page
 * 2 - it switch pages on hach change
*/
loadView();
window.onhashchange = loadView;

