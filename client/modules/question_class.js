'use strict';

export default class Question {
  constructor(data) {
    this.type = data.type;
    this.string = data.string;
    this.trueAns = data.trueAns;
    this.falseAns = data.falseAns;
    this.cost = data.cost;
  }

}
