'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket('ws://localhost:5000');
  socket.addEventListener('message', () => console.log('message'));
});
