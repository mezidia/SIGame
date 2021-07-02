'use strict';

export default class Question {
  constructor(data) {
    this.type = data.type;
    this.string = data.string;
    this.trueAns = data.trueAns;
    this.falseAns = data.falseAns;
    this.cost = data.cost;
    this.audio = data.audio;
    this.img = data.img;
  }

  getVisualizationType() {
    if (this.audio) return 'audio';
    else if (this.img) return 'img';
    else return 'txt';
  }

}
