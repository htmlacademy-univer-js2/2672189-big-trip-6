import Observable from '../framework/observable.js';
import { POINTS } from '../mock/point.js';
import { FilterType, UpdateType } from '../const.js';

function filterPointsByType(points, filterType) {
  const now = new Date();

  switch (filterType) {
    case FilterType.FUTURE:
      return points.filter((point) => point.dateFrom > now);
    case FilterType.PRESENT:
      return points.filter((point) => point.dateFrom <= now && point.dateTo >= now);
    case FilterType.PAST:
      return points.filter((point) => point.dateTo < now);
    case FilterType.EVERYTHING:
    default:
      return [...points];
  }
}

export default class PointsModel extends Observable {
  #points = structuredClone(POINTS);

  getPoints(filterType = FilterType.EVERYTHING) {
    return filterPointsByType(this.#points, filterType);
  }

  setPoints(points) {
    this.#points = structuredClone(points);
    this._notify(UpdateType.MAJOR);
  }

  addPoint(point) {
    this.#points = [structuredClone(point), ...this.#points];
    this._notify(UpdateType.MAJOR);
  }

  updatePoint(updatedPoint) {
    const pointIndex = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (pointIndex === -1) {
      return;
    }

    this.#points = [
      ...this.#points.slice(0, pointIndex),
      structuredClone(updatedPoint),
      ...this.#points.slice(pointIndex + 1),
    ];

    this._notify(UpdateType.PATCH);
  }

  removePoint(pointId) {
    this.#points = this.#points.filter((point) => point.id !== pointId);
    this._notify(UpdateType.MAJOR);
  }
}

