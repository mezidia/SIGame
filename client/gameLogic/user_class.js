'use strict';

export default class User {
  constructor(name, socket) {
    if (!User._instance) {
      User._instance = this;
    }
    this.socket = socket;
    this.name = name;
    this.room = {
      'name': null,
      'roomId': null,
    };
    return User._instance;

  }

  sendServerMsg() {
    
  }

}




