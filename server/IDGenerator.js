'use strict';

class IDGenerator {
  _usedID = [];

  constructor() {
    if (!IDGenerator._instance) {
      IDGenerator._instance = this;
    }
    return IDGenerator._instance;
  } 

  _gererateID() {
    const stringModel = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    function replaceRule(cur, replace) {
      if (cur !== 'x')  {
        return replace = Math.random() * 16 | 0;
      } else {
        return replace = (replace & 0x3 | 0x8).toString(16)
      }
    }
    return stringModel.replace(/[xy]/g, replaceRule);
  }

  getID() {
    let id = undefined;
    do {
      id = this._gererateID();
      console.log(id);
    } while (this._usedID.includes(id));
    this._usedID.push(id);
    return id;
  }

  removeID(id) {
    const idIndex = this._usedID.indexOf(id);
    if (idIndex !== -1) {
      this._usedID.splice(idIndex, 1);
      return true;
    }
    return false;
  }

}

module.exports = IDGenerator;