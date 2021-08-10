'use strict';

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function percentsOf(target, n) {
  return Math.ceil(target / 100 * n);
}

const promisifySocketMSG = (msg, awaitMsgType, socket, timeout = 222030203) => {
  return new Promise((resolve, reject) => {
    let timer = undefined;
    socket.send(JSON.stringify(msg));

    function responseHandler(msg) {
      const parsedMSG = JSON.parse(msg.data);
      if (parsedMSG.mType === awaitMsgType) {
        const result = parsedMSG;
        resolve(result);
        clearTimeout(timer);
      }
    }

    socket.addEventListener('message', responseHandler);

    timer = setTimeout(() => {
      reject(new Error('socket response timeout'));
      socket.removeEventListener('message', responseHandler);
    }, timeout);
  });
}

function byField(fieldName){
  return (a, b) => a[fieldName] > b[fieldName] ? 1 : -1;
}

export {
  promisifySocketMSG,
  getRandomIntInclusive,
  byField,
  percentsOf,

};

