import AbstractView from '../framework/view/abstract-view.js';

function createFilterTemplate(filters) {
  return `
    <form class="trip-filters" action="#" method="get">
      ${filters.map(({ name, label, isDisabled, isChecked }) => `
        <div class="trip-filters__filter">
          <input
            id="filter-${name}"
            class="trip-filters__filter-input visually-hidden"
            type="radio"
            name="trip-filter"
            value="${name}"
            ${isChecked ? 'checked' : ''}
            ${isDisabled ? 'disabled' : ''}
          >
          <label class="trip-filters__filter-label" for="filter-${name}">
            ${label}
          </label>
        </div>
      `).join('')}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FilterView extends AbstractView {
  #filters;
  #filterChangeHandler = null;

  constructor(filters) {
    super();
    this.#filters = filters;
  }

  get template() {
    return createFilterTemplate(this.#filters);
  }

  setFilterChangeHandler(callback) {
    this.#filterChangeHandler = callback;

    this.element
      .querySelector('.trip-filters')
      .addEventListener('change', this.#filterChangeHandlerClick);
  }

  #filterChangeHandlerClick = (evt) => {
    if (!evt.target.matches('.trip-filters__filter-input')) {
      return;
    }

    this.#filterChangeHandler?.(evt.target.value);
  };
}
