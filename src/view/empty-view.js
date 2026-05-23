import AbstractView from '../framework/view/abstract-view.js';

function createEmptyTemplate(message) {
  return `
    <p class="trip-events__msg">
      ${message}
    </p>
  `;
}

export default class EmptyView extends AbstractView {
  #message;

  constructor(message) {
    super();
    this.#message = message;
  }

  get template() {
    return createEmptyTemplate(this.#message);
  }
}
