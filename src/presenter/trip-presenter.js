import { render, replace, remove } from '../framework/render.js';
import dayjs from 'dayjs';

import TripInfoView from '../view/trip-info-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EmptyView from '../view/empty-view.js';
import PointPresenter from './point-presenter.js';
import { ActionType, FilterType, SortType } from '../const.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

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

function getDestinationName(destinationId, destinations) {
  return destinations.find((destination) => destination.id === destinationId)?.name ?? '';
}

function getPointExtraCost(point, offers) {
  const offersByType = offers.find((offer) => offer.type === point.type);

  if (!offersByType) {
    return 0;
  }

  return offersByType.offers.reduce((sum, offer) => (
    point.offers.includes(offer.id) ? sum + Number(offer.price) : sum
  ), 0);
}

function getTripTitle(points, destinations) {
  const destinationNames = points
    .map((point) => getDestinationName(point.destination, destinations))
    .filter(Boolean);

  if (destinationNames.length === 0) {
    return '';
  }

  if (destinationNames.length > 3) {
    return `${destinationNames[0]} ... ${destinationNames[destinationNames.length - 1]}`;
  }

  return destinationNames.join(' — ');
}

function getTripInfo(points, destinations, offers) {
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
    title: getTripTitle(sortedByStart, destinations),
    cost: points.reduce((sum, point) => sum + Number(point.basePrice) + getPointExtraCost(point, offers), 0),
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
    dateFrom: null,
    dateTo: null,
    destination: null,
    offers: [],
    isFavorite: false,
  };
}

export default class TripPresenter {
  #mainContainer;
  #headerContainer;
  #pointsModel;
  #filterModel;
  #destinationsModel;
  #offersModel;

  #eventListComponent = new EventListView();
  #sortComponent = null;
  #tripInfoComponent = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY;
  #isCreatingNewPoint = false;
  #addButtonElement = null;
  #uiBlocker = new UiBlocker({lowerLimit: 300, upperLimit: 500});

  constructor({ mainContainer, headerContainer, pointsModel, filterModel, destinationsModel, offersModel }) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#destinationsModel = destinationsModel;
    this.#offersModel = offersModel;

    this.#pointsModel.addObserver(this.#handlePointsModelChange);
    this.#filterModel.addObserver(this.#handleFilterModelChange);
  }

  init() {
    this.#addButtonElement = this.#headerContainer.querySelector('.trip-main__event-add-btn');
    this.#addButtonElement.addEventListener('click', this.#handleAddNewPointClick);
    this.#addButtonElement.disabled = false;

    this.#renderTripInfo();
    this.#renderSort();
    this.#renderBoard();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#eventListComponent.element,
      destinations: this.#destinationsModel.getDestinations(),
      offers: this.#offersModel.getOffers(),
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
    const allPoints = this.#pointsModel.getPoints(FilterType.EVERYTHING);

    if (allPoints.length === 0) {
      if (previousTripInfoComponent !== null) {
        remove(previousTripInfoComponent);
        this.#tripInfoComponent = null;
      }

      return;
    }

    const tripInfo = getTripInfo(allPoints, this.#destinationsModel.getDestinations());

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
      destinations: this.#destinationsModel.getDestinations(),
      offers: this.#offersModel.getOffers(),
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
      onViewClose: this.#handleNewPointClose,
    });

    this.#newPointPresenter.init(createNewPoint(this.#destinationsModel.getDestinations()), true);
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
    const pointPresenter = update.id ? this.#pointPresenters.get(update.id) : this.#newPointPresenter;

    this.#toggleInterfaceState(true);
    this.#uiBlocker.block();

    if (actionType === ActionType.ADD_POINT) {
      this.#isCreatingNewPoint = false;
    }

    if (actionType === ActionType.UPDATE_POINT && pointPresenter?.isEditing()) {
      pointPresenter.setSaving();
    }

    if (actionType === ActionType.ADD_POINT) {
      pointPresenter?.setSaving();
    }

    if (actionType === ActionType.DELETE_POINT) {
      pointPresenter?.setDeleting();
    }

    this.#updatePoint(actionType, update, pointPresenter);
  };

  #updatePoint = async (actionType, update, pointPresenter) => {
    try {
      switch (actionType) {
        case ActionType.UPDATE_POINT:
          await this.#pointsModel.updatePoint(update);
          break;
        case ActionType.ADD_POINT:
          await this.#pointsModel.createPoint(update);
          this.#newPointPresenter?.destroy();
          this.#newPointPresenter = null;
          break;
        case ActionType.DELETE_POINT:
          await this.#pointsModel.removePoint(update.id);
          break;
        default:
          break;
      }
    } catch (error) {
      if (actionType === ActionType.ADD_POINT) {
        this.#isCreatingNewPoint = true;
      }

      pointPresenter?.setAborting();
    } finally {
      this.#uiBlocker.unblock();
      setTimeout(() => {
        this.#toggleInterfaceState(false);
        if (actionType === ActionType.ADD_POINT) {
          this.#addButtonElement.disabled = false;
        }
      }, 500);
    }
  };

  #toggleInterfaceState() {
  }

  #handleModeChange = () => {
    this.#newPointPresenter?.destroy();
    this.#newPointPresenter = null;
    this.#pointPresenters.forEach((pointPresenter) => pointPresenter.resetView());
  };

  #handleNewPointClose = () => {
    this.#isCreatingNewPoint = false;
    this.#addButtonElement.disabled = false;
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
    this.#addButtonElement.disabled = true;

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
