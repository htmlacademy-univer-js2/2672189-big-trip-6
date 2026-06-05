import { render, replace, remove } from '../framework/render.js';

import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';
import { ActionType, UpdateType } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointListContainer;
  #onDataChange;
  #onModeChange;
  #onViewClose;
  #destinations;
  #offers;

  #point;
  #pointComponent = null;
  #editComponent = null;
  #mode = Mode.DEFAULT;
  #isNewPoint = false;

  constructor({ pointListContainer, destinations, offers, onDataChange, onModeChange, onViewClose }) {
    this.#pointListContainer = pointListContainer;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
    this.#onViewClose = onViewClose;
  }

  init(point, isNewPoint = false) {
    this.#point = point;
    this.#isNewPoint = isNewPoint;

    const prevPointComponent = this.#pointComponent;
    const prevEditComponent = this.#editComponent;

    this.#pointComponent = isNewPoint ? null : new EventView(this.#point, this.#destinations, this.#offers);
    this.#editComponent = new EventEditView(this.#point, this.#destinations, this.#offers);

    if (this.#pointComponent !== null) {
      this.#pointComponent.setEditClickHandler(this.#handleEditClick);
      this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    }

    this.#editComponent.setSubmitHandler(this.#handleFormSubmit);
    this.#editComponent.setResetClickHandler(this.#handleFormResetClick);
    this.#editComponent.setRollupClickHandler(this.#handleFormRollupClick);

    if (isNewPoint) {
      render(this.#editComponent, this.#pointListContainer);
      document.addEventListener('keydown', this.#escKeyDownHandler);
      this.#mode = Mode.EDITING;
      return;
    }

    if (prevPointComponent === null || prevEditComponent === null) {
      render(this.#pointComponent, this.#pointListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointComponent, prevEditComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevPointComponent);
    remove(prevEditComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT && !this.#isNewPoint) {
      this.#replaceFormWithPoint();
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    remove(this.#pointComponent);
    remove(this.#editComponent);
    this.#pointComponent = null;
    this.#editComponent = null;
    this.#mode = Mode.DEFAULT;
  }

  isEditing() {
    return this.#mode === Mode.EDITING;
  }

  setSaving() {
    this.#editComponent.updateElement({
      isDisabled: true,
      saveButtonText: 'Saving...',
    });
  }

  setDeleting() {
    this.#editComponent.updateElement({
      isDisabled: true,
      resetButtonText: 'Deleting...',
    });
  }

  setAborting() {
    if (this.#mode === Mode.EDITING || this.#isNewPoint) {
      this.#editComponent.updateElement({
        isDisabled: false,
        saveButtonText: 'Save',
        resetButtonText: this.#isNewPoint ? 'Cancel' : 'Delete',
      });

      this.#editComponent.shake();
      return;
    }

    if (this.#pointComponent !== null) {
      this.#pointComponent.shake();
    }
  }

  #replacePointWithForm() {
    if (this.#editComponent === null) {
      this.#editComponent = new EventEditView(this.#point, this.#destinations, this.#offers);
      this.#editComponent.setSubmitHandler(this.#handleFormSubmit);
      this.#editComponent.setResetClickHandler(this.#handleFormResetClick);
      this.#editComponent.setRollupClickHandler(this.#handleFormRollupClick);
    }

    replace(this.#editComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.EDITING;
  }

  #replaceFormWithPoint() {
    if (this.#isNewPoint) {
      this.#closeNewPointForm();
      return;
    }

    replace(this.#pointComponent, this.#editComponent);
    remove(this.#editComponent);
    this.#editComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #closeNewPointForm() {
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    remove(this.#editComponent);
    this.#mode = Mode.DEFAULT;
    this.#onViewClose?.();
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormWithPoint();
    }
  };

  #handleEditClick = () => {
    this.#onModeChange();
    this.#replacePointWithForm();
  };

  #handleFormSubmit = (updatedPoint) => {
    const normalizedPoint = {
      ...updatedPoint,
      basePrice: Number(updatedPoint.basePrice),
    };

    if (this.#isNewPoint) {
      this.#onDataChange(ActionType.ADD_POINT, UpdateType.MINOR, normalizedPoint);
      return;
    }

    this.#onDataChange(ActionType.UPDATE_POINT, UpdateType.MINOR, normalizedPoint);
  };

  #handleFormRollupClick = () => {
    this.#replaceFormWithPoint();
  };

  #handleFormResetClick = () => {
    if (this.#isNewPoint) {
      this.#closeNewPointForm();
      return;
    }

    this.#onDataChange(ActionType.DELETE_POINT, UpdateType.MAJOR, this.#point);
  };

  #handleFavoriteClick = () => {
    this.#onDataChange(ActionType.UPDATE_POINT, UpdateType.PATCH, {
      ...this.#point,
      isFavorite: !this.#point.isFavorite,
    });
  };
}
