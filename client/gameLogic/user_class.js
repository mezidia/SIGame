'use strict';

export default class User {
  constructor(name, id, socket) {
    this.socket = socket;
    this.name = name;
    this.room = {
      'name': null,
      'roomId': null,
    };
    _id = id;
  }

}




