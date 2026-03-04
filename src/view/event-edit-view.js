import { createElement } from '../render.js';
import { DESTINATIONS, OFFERS } from '../mock/point.js';

export default class EventEditView {
  constructor(point = {}) {
    this.point = point;
  }

  getTemplate() {
    const {
      type = 'taxi',
      destination = null,
      dateFrom = '',
      dateTo = '',
      basePrice = '',
      offers = []
    } = this.point;

    const destinationData = DESTINATIONS.find((d) => d.id === destination);

    const destinationName = destinationData ? destinationData.name : '';
    const destinationDescription = destinationData ? destinationData.description : '';
    const destinationPictures = destinationData ? destinationData.pictures : [];

    const offersForType = OFFERS;

    const offersTemplate = offersForType
      .map((offer) => {
        const isChecked = offers.includes(offer.id) ? 'checked' : '';
        return `
          <div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="offer-${offer.id}" type="checkbox" name="offer" ${isChecked}>
            <label class="event__offer-label" for="offer-${offer.id}">
              <span class="event__offer-title">${offer.title}</span>
              +€&nbsp;<span class="event__offer-price">${offer.price}</span>
            </label>
          </div>
        `;
      })
      .join('');

    const picturesTemplate = destinationPictures
      .map((pic) => `<img class="event__photo" src="${pic.src}" alt="${pic.description}">`)
      .join('');

    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="event__type-icon">
                <img src="img/icons/${type}.png" width="17" height="17" alt="Event type icon">
              </span>
            </label>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}">
          </div>

          <div class="event__field-group  event__field-group--time">
            <input class="event__input  event__input--time" type="text" name="event-start-time" value="${dateFrom}">
            —
            <input class="event__input  event__input--time" type="text" name="event-end-time" value="${dateTo}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <input class="event__input  event__input--price" type="number" name="event-price" value="${basePrice}">
          </div>
        </header>

        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersTemplate}
            </div>
          </section>

          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${destinationDescription}</p>

            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${picturesTemplate}
              </div>
            </div>
          </section>
        </section>
      </form>
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
