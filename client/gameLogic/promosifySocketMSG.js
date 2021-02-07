'use strict';

export default function promisifySocketMSG(msg, awaitMsgType, socket, timeout = 2000) {
  return new Promise((resolve, reject) => {
    let timer = undefined;
    socket.send(JSON.stringify(msg));

    function responseHandler(msg) {
      const parsedMSG = JSON.parse(msg.data);
      console.log(msg.data)
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

