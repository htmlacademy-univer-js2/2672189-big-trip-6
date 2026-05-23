import { render } from '../framework/render.js';

import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EmptyView from '../view/empty-view.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  #mainContainer;
  #headerContainer;
  #filterContainer;
  #pointsModel;

  #eventListComponent = new EventListView();
  #pointPresenters = new Map();

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
    render(new SortView(), this.#mainContainer);
    if (points.length === 0) {
      render(new EmptyView(), this.#mainContainer);
      return;
    }
    render(this.#eventListComponent, this.#mainContainer);

    points.forEach((point) => this.#renderPoint(point));
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

  #handlePointChange = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  };
}
