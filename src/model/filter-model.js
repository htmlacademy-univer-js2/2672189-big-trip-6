import Observable from '../framework/observable.js';
import { FilterType, UpdateType } from '../const.js';

export default class FilterModel extends Observable {
  #filter = FilterType.EVERYTHING;

  getFilter() {
    return this.#filter;
  }

  setFilter(filterType, payload = {}) {
    if (this.#filter === filterType) {
      return false;
    }

    this.#filter = filterType;
    this._notify(UpdateType.MAJOR, payload);
    return true;
  }
}
