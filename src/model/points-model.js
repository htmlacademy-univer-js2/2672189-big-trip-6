import { POINTS } from '../mock/point.js';

export default class PointsModel {
  #points = POINTS;

  getPoints() {
    return this.#points;
  }

  updatePoint(updatedPoint) {
    this.#points = this.#points.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );
  }
}

