import { POINTS } from '../mock/point.js';

export default class PointsModel {
  #points = POINTS;

  getPoints() {
    return this.#points;
  }
}

