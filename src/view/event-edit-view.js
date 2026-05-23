import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { DESTINATIONS, OFFERS } from '../mock/point.js';

const EVENT_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

function getDestination(point) {
  return DESTINATIONS.find((d) => d.id === point.destination);
}

function getOffersByType(type) {
  const offersByType = OFFERS.find((offer) => offer.type === type);
  return offersByType ? offersByType.offers : [];
}

function createEventTypeItemsTemplate(currentType, pointId) {
  return EVENT_TYPES.map((type) => {
    const isChecked = type === currentType ? 'checked' : '';

    return `
      <div class="event__type-item">
        <input
          id="event-type-${type}-${pointId}"
          class="event__type-input visually-hidden"
          type="radio"
          name="event-type"
          value="${type}"
          ${isChecked}
        >
        <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${pointId}">${type}</label>
      </div>
    `;
  }).join('');
}

function createDestinationListTemplate(pointId) {
  const destinations = DESTINATIONS.map((destination) => `<option value="${destination.name}"></option>`).join('');

  return `
    <datalist id="destination-list-${pointId}">
      ${destinations}
    </datalist>
  `;
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

function createDestinationPhotosTemplate(pictures) {
  if (!pictures.length) {
    return '';
  }

  const photoItems = pictures
    .map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`)
    .join('');

  return `
    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${photoItems}
      </div>
    </div>
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
      ${createDestinationPhotosTemplate(destination.pictures)}
    </section>
  `;
}

function createEditFormTemplate(point) {
  const destination = getDestination(point);
  const pointId = point.id ?? 'new';
  const dateFormat = 'DD/MM/YY HH:mm';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${pointId}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${pointId}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createEventTypeItemsTemplate(point.type, pointId)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-${pointId}">${point.type}</label>
            <input class="event__input  event__input--destination" id="event-destination-${pointId}" type="text" name="event-destination" value="${destination?.name ?? ''}" list="destination-list-${pointId}">
            ${createDestinationListTemplate(pointId)}
          </div>

          <div class="event__field-group  event__field-group--time">
            <input class="event__input  event__input--time  event__input--time-start" type="text" name="event-start-time" value="${dayjs(point.dateFrom).format(dateFormat)}">
            &mdash;
            <input class="event__input  event__input--time  event__input--time-end" type="text" name="event-end-time" value="${dayjs(point.dateTo).format(dateFormat)}">
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

export default class EventEditView extends AbstractStatefulView {
  #submitCallback = null;
  #rollupCallback = null;
  #startDatePicker = null;
  #endDatePicker = null;

  constructor(point) {
    super();
    this._setState(point);
    this.#setInnerHandlers();
  }

  get template() {
    return createEditFormTemplate(this._state);
  }

  setSubmitHandler(callback) {
    this.#submitCallback = callback;
    this.element
      .querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);
  }

  setRollupClickHandler(callback) {
    this.#rollupCallback = callback;
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);
  }

  _restoreHandlers() {
    this.setSubmitHandler(this.#submitCallback);
    this.setRollupClickHandler(this.#rollupCallback);
    this.#setInnerHandlers();
    this.#setDatepickers();
  }

  removeElement() {
    this.#destroyDatepickers();
    super.removeElement();
  }

  #setInnerHandlers() {
    this.element
      .querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element
      .querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.element
      .querySelector('.event__available-offers')
      ?.addEventListener('change', this.#offersChangeHandler);

    this.element
      .querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);
  }

  #setDatepickers() {
    this.#destroyDatepickers();

    const startInput = this.element.querySelector('.event__input--time-start');
    const endInput = this.element.querySelector('.event__input--time-end');

    this.#startDatePicker = flatpickr(startInput, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      'time_24hr': true,
      defaultDate: this._state.dateFrom,
      allowInput: true,
      onChange: ([selectedDate]) => {
        this._setState({
          dateFrom: selectedDate,
        });
      },
    });

    this.#endDatePicker = flatpickr(endInput, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      'time_24hr': true,
      defaultDate: this._state.dateTo,
      allowInput: true,
      onChange: ([selectedDate]) => {
        this._setState({
          dateTo: selectedDate,
        });
      },
    });
  }

  #destroyDatepickers() {
    this.#startDatePicker?.destroy();
    this.#endDatePicker?.destroy();
    this.#startDatePicker = null;
    this.#endDatePicker = null;
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#submitCallback?.(this._state);
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#rollupCallback?.();
  };

  #typeChangeHandler = (evt) => {
    if (!evt.target.matches('.event__type-input')) {
      return;
    }

    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    const destination = DESTINATIONS.find((item) => item.name === evt.target.value);

    if (!destination) {
      return;
    }

    this.updateElement({
      destination: destination.id,
    });
  };

  #offersChangeHandler = (evt) => {
    if (!evt.target.matches('.event__offer-checkbox')) {
      return;
    }

    const offerId = Number(evt.target.id.replace('event-offer-', ''));
    const offers = new Set(this._state.offers);

    if (evt.target.checked) {
      offers.add(offerId);
    } else {
      offers.delete(offerId);
    }

    this._setState({
      offers: [...offers],
    });
  };

  #priceInputHandler = (evt) => {
    this._setState({
      basePrice: evt.target.value,
    });
  };
}
