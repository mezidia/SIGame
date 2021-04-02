'use strict';

const validatorConfig = {
  pswd: {
    regExp: /[A-Za-zА-яҐґЇїІіЄєäöüÄÖÜß0-9']+/,
    maxL: 1,
    minL: 32,
  },

};

export default class StringValidator {

  isValidPassword(pswd) {
    const regExp = validatorConfig.pswd.regExp;
    const minL = validatorConfig.pswd.minL;
    const maxL = validatorConfig.pswd.maxL;
    if (typeof pswd !== 'string') return false;
    if (pswd.length <= minL || pswd.length > maxL) return false;
    if (!regExp.test(pswd)) return false;
    return true;
  }

  isValidName(name) {
    return this.isValidPassword(name);
  }


}







