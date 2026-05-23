import { render, replace, remove } from '../framework/render.js';
import dayjs from 'dayjs';

import TripInfoView from '../view/trip-info-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EmptyView from '../view/empty-view.js';
import PointPresenter from './point-presenter.js';
import { ActionType, FilterType, SortType } from '../const.js';
import { DESTINATIONS } from '../mock/point.js';

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

function getDestinationName(destinationId) {
  return DESTINATIONS.find((destination) => destination.id === destinationId)?.name ?? '';
}

function getTripInfo(points) {
  if (points.length === 0) {
    return {
      title: '',
      cost: 0,
    };
  }

  const sortedByStart = [...points].sort(sortByDay);

  return {
    dateFrom: dayjs(sortedByStart[0].dateFrom).toDate(),
    dateTo: dayjs(sortedByStart[sortedByStart.length - 1].dateTo).toDate(),
    title: sortedByStart.map((point) => getDestinationName(point.destination)).filter(Boolean).join(' — '),
    cost: points.reduce((sum, point) => sum + Number(point.basePrice), 0),
  };
}

function getEmptyMessage(filterType) {
  switch (filterType) {
    case FilterType.FUTURE:
      return 'There are no future events now';
    case FilterType.PRESENT:
      return 'There are no present events now';
    case FilterType.PAST:
      return 'There are no past events now';
    case FilterType.EVERYTHING:
    default:
      return 'Click New Event to create your first point';
  }
}

function createNewPoint() {
  return {
    id: null,
    type: 'flight',
    basePrice: 0,
    dateFrom: new Date(),
    dateTo: dayjs().add(1, 'hour').toDate(),
    destination: DESTINATIONS[0].id,
    offers: [],
    isFavorite: false,
  };
}

export default class TripPresenter {
  #mainContainer;
  #headerContainer;
  #pointsModel;
  #filterModel;

  #eventListComponent = new EventListView();
  #sortComponent = null;
  #tripInfoComponent = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY;
  #isCreatingNewPoint = false;
  #addButtonElement = null;

  constructor({ mainContainer, headerContainer, pointsModel, filterModel }) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#pointsModel.addObserver(this.#handlePointsModelChange);
    this.#filterModel.addObserver(this.#handleFilterModelChange);
  }

  init() {
    this.#addButtonElement = this.#headerContainer.querySelector('.trip-main__event-add-btn');
    this.#addButtonElement.addEventListener('click', this.#handleAddNewPointClick);

    this.#renderTripInfo();
    this.#renderSort();
    this.#renderBoard();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onDataChange: this.#handleViewAction,
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

  #renderTripInfo() {
    const previousTripInfoComponent = this.#tripInfoComponent;
    const tripInfo = getTripInfo(this.#getPoints());

    this.#tripInfoComponent = new TripInfoView(tripInfo);

    if (previousTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#headerContainer, 'afterbegin');
      return;
    }

    replace(this.#tripInfoComponent, previousTripInfoComponent);
  }

  #renderBoard() {
    this.#clearBoard();

    const points = this.#getSortedPoints();

    if (points.length === 0 && !this.#isCreatingNewPoint) {
      render(new EmptyView(getEmptyMessage(this.#filterModel.getFilter())), this.#mainContainer);
      return;
    }

    render(this.#eventListComponent, this.#mainContainer);

    if (this.#isCreatingNewPoint) {
      this.#renderNewPoint();
    }

    points.forEach((point) => this.#renderPoint(point));
  }

  #renderNewPoint() {
    this.#newPointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
      onViewClose: this.#handleNewPointClose,
    });

    this.#newPointPresenter.init(createNewPoint(), true);
  }

  #clearBoard() {
    this.#clearPoints();

    if (this.#newPointPresenter !== null) {
      this.#newPointPresenter.destroy();
      this.#newPointPresenter = null;
    }

    remove(this.#eventListComponent);

    const emptyElement = this.#mainContainer.querySelector('.trip-events__msg');

    if (emptyElement !== null) {
      emptyElement.remove();
    }
  }

  #clearPoints() {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.destroy());
    this.#pointPresenters.clear();
  }

  #getSortedPoints() {
    const points = [...this.#getPoints()];

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

  #getPoints() {
    return this.#pointsModel.getPoints(this.#filterModel.getFilter());
  }

  #handleViewAction = (actionType, _updateType, update) => {
    switch (actionType) {
      case ActionType.UPDATE_POINT:
        this.#pointsModel.updatePoint(update);
        break;
      case ActionType.ADD_POINT:
        this.#isCreatingNewPoint = false;
        this.#pointsModel.addPoint(update);
        break;
      case ActionType.DELETE_POINT:
        this.#pointsModel.removePoint(update.id);
        break;
      default:
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  };

  #handleNewPointClose = () => {
    this.#isCreatingNewPoint = false;
    this.#renderBoard();
  };

  #handlePointsModelChange = () => {
    this.#renderTripInfo();
    this.#renderSort();
    this.#renderBoard();
  };

  #handleFilterModelChange = (_event, payload) => {
    this.#currentSortType = SortType.DAY;
    this.#isCreatingNewPoint = Boolean(payload?.keepNewPointOpen);

    this.#renderTripInfo();
    this.#renderSort();
    this.#renderBoard();
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderSort();
    this.#renderBoard();
  };

  #handleAddNewPointClick = () => {
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;

    this.#isCreatingNewPoint = true;
    this.#currentSortType = SortType.DAY;

    const filterChanged = this.#filterModel.setFilter(FilterType.EVERYTHING, {
      keepNewPointOpen: true,
    });

    if (!filterChanged) {
      this.#renderSort();
      this.#isCreatingNewPoint = true;
      this.#renderTripInfo();
      this.#renderBoard();
    }
  };
}
