import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';

const SORT_ITEMS = [
  {id: 'sort-day', label: 'Day', value: 'sort-day', sortType: SortType.DAY},
  {id: 'sort-event', label: 'Event', value: 'sort-event', disabled: true},
  {id: 'sort-time', label: 'Time', value: 'sort-time', sortType: SortType.TIME},
  {id: 'sort-price', label: 'Price', value: 'sort-price', sortType: SortType.PRICE},
  {id: 'sort-offer', label: 'Offers', value: 'sort-offer', disabled: true},
];

function createSortTemplate(currentSortType) {
  const itemsTemplate = SORT_ITEMS.map(({id, label, value, sortType, disabled = false}) => {
    const checked = sortType === currentSortType ? 'checked' : '';
    const disabledAttribute = disabled ? 'disabled' : '';
    const dataAttribute = sortType ? `data-sort-type="${sortType}"` : '';

    return `
      <div class="trip-sort__item  trip-sort__item--${value.replace('sort-','')}">
        <input id="${id}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${value}" ${disabledAttribute} ${checked} ${dataAttribute}>
        <label class="trip-sort__btn" for="${id}">${label}</label>
      </div>
    `;
  }).join('');

  return `
    <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${itemsTemplate}
    </form>
  `;
}

export default class SortView extends AbstractView {
  #currentSortType;
  #sortTypeChangeHandler = null;

  constructor(currentSortType) {
    super();
    this.#currentSortType = currentSortType;
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  setSortTypeChangeHandler(callback) {
    this.#sortTypeChangeHandler = callback;

    this.element.querySelectorAll('.trip-sort__input').forEach((input) => {
      input.addEventListener('click', this.#sortTypeChangeHandlerClick);
    });
  }

  #sortTypeChangeHandlerClick = (evt) => {
    const sortType = evt.target.dataset.sortType;

    if (!sortType) {
      return;
    }

    this.#sortTypeChangeHandler?.(sortType);
  };
}
