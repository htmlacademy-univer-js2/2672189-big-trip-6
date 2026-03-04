import { createElement } from '../render.js';

export default class EventView {
  constructor(point) {
    this.point = point;
  }

  getTemplate() {
    const { type, basePrice, dateFrom, dateTo } = this.point;

    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date">${dateFrom}</time>
          <div class="event__type">
            <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
          </div>
          <h3 class="event__title">${type}</h3>
          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time">${dateFrom}</time>
              —
              <time class="event__end-time">${dateTo}</time>
            </p>
          </div>
          <p class="event__price">
            €&nbsp;<span class="event__price-value">${basePrice}</span>
          </p>
        </div>
      </li>
    `;
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
