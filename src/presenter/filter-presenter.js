import { render, replace } from '../framework/render.js';

import FilterView from '../view/filter-view.js';
import { FilterType } from '../const.js';

function getFilterLabel(filterType) {
  return filterType.charAt(0).toUpperCase() + filterType.slice(1);
}

export default class FilterPresenter {
  #filterContainer;
  #filterModel;
  #pointsModel;

  #filterComponent = null;

  constructor({ filterContainer, filterModel, pointsModel }) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    this.#filterModel.addObserver(this.#handleModelChange);
    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  init() {
    const previousFilterComponent = this.#filterComponent;
    const currentFilter = this.#filterModel.getFilter();

    const filters = Object.values(FilterType).map((filterType) => ({
      name: filterType,
      label: getFilterLabel(filterType),
      isDisabled: this.#pointsModel.getPoints(filterType).length === 0,
      isChecked: filterType === currentFilter,
    }));

    this.#filterComponent = new FilterView(filters);
    this.#filterComponent.setFilterChangeHandler(this.#handleFilterTypeChange);

    if (previousFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, previousFilterComponent);
  }

  #handleModelChange = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    this.#filterModel.setFilter(filterType);
  };
}
