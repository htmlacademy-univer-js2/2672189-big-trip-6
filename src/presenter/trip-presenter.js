import { render, replace } from '../framework/render.js';

import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EmptyView from '../view/empty-view.js';
import PointPresenter from './point-presenter.js';

const SortType = {
  DAY: 'day',
  TIME: 'time',
  PRICE: 'price',
};

function sortByDay(pointA, pointB) {
  return pointA.dateFrom - pointB.dateFrom;
}

function sortByTime(pointA, pointB) {
  const durationA = pointA.dateTo - pointA.dateFrom;
  const durationB = pointB.dateTo - pointB.dateFrom;

  return durationB - durationA;
}

function sortByPrice(pointA, pointB) {
  return pointB.basePrice - pointA.basePrice;
}

export default class TripPresenter {
  #mainContainer;
  #headerContainer;
  #filterContainer;
  #pointsModel;

  #eventListComponent = new EventListView();
  #sortComponent = null;
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;

  constructor({ mainContainer, headerContainer, filterContainer, pointsModel }) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
    this.#filterContainer = filterContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    const points = this.#pointsModel.getPoints();
    render(new TripInfoView(), this.#headerContainer);
    const filters = [
      { name: 'everything', isDisabled: false, isChecked: true },
      { name: 'future', isDisabled: points.length === 0, isChecked: false },
    ];
    render(new FilterView(filters), this.#filterContainer);
    this.#renderSort();
    if (points.length === 0) {
      render(new EmptyView(), this.#mainContainer);
      return;
    }
    render(this.#eventListComponent, this.#mainContainer);

    this.#renderPoints();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderSort() {
    const previousSortComponent = this.#sortComponent;

    this.#sortComponent = new SortView(this.#currentSortType);
    this.#sortComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);

    if (previousSortComponent === null) {
      render(this.#sortComponent, this.#mainContainer);
      return;
    }

    replace(this.#sortComponent, previousSortComponent);
  }

  #renderPoints() {
    this.#clearPoints();

    this.#getSortedPoints().forEach((point) => this.#renderPoint(point));
  }

  #clearPoints() {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.destroy());
    this.#pointPresenters.clear();
  }

  #getSortedPoints() {
    const points = [...this.#pointsModel.getPoints()];

    switch (this.#currentSortType) {
      case SortType.TIME:
        return points.sort(sortByTime);
      case SortType.PRICE:
        return points.sort(sortByPrice);
      case SortType.DAY:
      default:
        return points.sort(sortByDay);
    }
  }

  #handlePointChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
    this.#renderPoints();
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderSort();
    this.#renderPoints();
  };
}
