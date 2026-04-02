import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import { DESTINATIONS, OFFERS } from '../mock/point.js';

function getDestination(point) {
  return DESTINATIONS.find((d) => d.id === point.destination);
}

function getOffersByType(type) {
  const offersByType = OFFERS.find((offer) => offer.type === type);
  return offersByType ? offersByType.offers : [];
}

function createOffersEditTemplate(point) {
  const offers = getOffersByType(point.type);

  if (!offers.length) {
    return '';
  }

  const items = offers.map((offer) => {
    const checked = point.offers.includes(offer.id) ? 'checked' : '';
    return `
      <div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer" ${checked}>
        <label class="event__offer-label" for="event-offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');

  return `
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${items}
      </div>
    </section>
  `;
}

function createDestinationTemplate(point) {
  const destination = getDestination(point);

  if (!destination) {
    return '';
  }

  return `
    <section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${destination.description}</p>
    </section>
  `;
}

function createEditFormTemplate(point) {
  const destination = getDestination(point);

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn">
              <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
            </label>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output">${point.type}</label>
            <input class="event__input  event__input--destination" type="text" name="event-destination" value="${destination?.name ?? ''}">
          </div>

          <div class="event__field-group  event__field-group--time">
            <input class="event__input  event__input--time" type="text" name="event-start-time" value="${dayjs(point.dateFrom).format('DD/MM/YY HH:mm')}">
            &mdash;
            <input class="event__input  event__input--time" type="text" name="event-end-time" value="${dayjs(point.dateTo).format('DD/MM/YY HH:mm')}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label">&euro;</label>
            <input class="event__input  event__input--price" type="number" name="event-price" value="${point.basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Close event</span>
          </button>
        </header>

        <section class="event__details">
          ${createOffersEditTemplate(point)}
          ${createDestinationTemplate(point)}
        </section>
      </form>
    </li>
  `;
}

export default class EventEditView extends AbstractView {
  #point;

  constructor(point) {
    super();
    this.#point = point;
  }

  get template() {
    return createEditFormTemplate(this.#point);
  }

  setSubmitHandler(callback) {
    this.element
      .querySelector('form')
      .addEventListener('submit', (evt) => {
        evt.preventDefault();
        callback();
      });
  }

  setRollupClickHandler(callback) {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', callback);
  }
}
