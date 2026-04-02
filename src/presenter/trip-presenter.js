import { render, replace } from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';

export default class TripPresenter {
  #mainContainer;
  #headerContainer;
  #filterContainer;
  #pointsModel;
  #eventListComponent = new EventListView();

  constructor({ mainContainer, headerContainer, filterContainer, pointsModel }) {
    this.#mainContainer = mainContainer;
    this.#headerContainer = headerContainer;
    this.#filterContainer = filterContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    const points = this.#pointsModel.getPoints();

    render(new TripInfoView(), this.#headerContainer);
    render(new FilterView(), this.#filterContainer);
    render(new SortView(), this.#mainContainer);
    render(this.#eventListComponent, this.#mainContainer);

    points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const pointComponent = new EventView(point);
    const editComponent = new EventEditView(point);

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.#replaceFormWithPoint(pointComponent, editComponent);
        document.removeEventListener('keydown', onEscKeyDown);
      }
    };

    pointComponent.setEditClickHandler(() => {
      this.#replacePointWithForm(pointComponent, editComponent);
      document.addEventListener('keydown', onEscKeyDown);
    });

    editComponent.setSubmitHandler(() => {
      this.#replaceFormWithPoint(pointComponent, editComponent);
      document.removeEventListener('keydown', onEscKeyDown);
    });

    editComponent.setRollupClickHandler(() => {
      this.#replaceFormWithPoint(pointComponent, editComponent);
      document.removeEventListener('keydown', onEscKeyDown);
    });

    render(pointComponent, this.#eventListComponent.element);
  }

  #replacePointWithForm(pointComponent, editComponent) {
    replace(editComponent, pointComponent);
  }

  #replaceFormWithPoint(pointComponent, editComponent) {
    replace(pointComponent, editComponent);
  }
}
