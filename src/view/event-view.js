import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { encode } from 'he';
import { getDestination } from './destination.js';

dayjs.extend(duration);

function getOffersForPoint(point, offers) {
  const offersByType = offers.find((offer) => offer.type === point.type);
  if (!offersByType) {
    return [];
  }
  return offersByType.offers.filter((offer) => point.offers.includes(offer.id));
}

function formatDate(date) {
  return dayjs(date).format('MMM DD');
}

function formatTime(date) {
  return dayjs(date).format('HH:mm');
}

function formatDuration(dateFrom, dateTo) {
  const diff = dayjs(dateTo).diff(dayjs(dateFrom));
  const d = dayjs.duration(diff);

  const days = Math.floor(d.asDays());
  const hours = d.hours();
  const minutes = d.minutes();

  if (days > 0) {
    return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }

  return `${String(minutes).padStart(2, '0')}M`;
}

function createOffersTemplate(offers) {
  if (!offers.length) {
    return '';
  }

  const items = offers.map((offer) =>
    `<li class="event__offer">
      <span class="event__offer-title">${encode(offer.title)}</span>
      &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
    </li>`
  ).join('');

  return `
    <section class="event__offers">
      <h3 class="event__offers-title">Offers</h3>
      <ul class="event__selected-offers">
        ${items}
      </ul>
    </section>
  `;
}

function createEventTemplate(point, destinations, offers) {
  const destination = getDestination(point, destinations);
  const selectedOffers = getOffersForPoint(point, offers);
  const favoriteClassName = point.isFavorite ? 'event__favorite-btn--active' : '';
  const safePointType = encode(point.type);
  const safeDestinationName = encode(destination?.name ?? '');

  const dateFrom = formatDate(point.dateFrom);
  const timeFrom = formatTime(point.dateFrom);
  const timeTo = formatTime(point.dateTo);
  const tripDuration = formatDuration(point.dateFrom, point.dateTo);

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${point.dateFrom.toISOString()}">${dateFrom}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${safePointType}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${safePointType} ${safeDestinationName}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${point.dateFrom.toISOString()}">${timeFrom}</time>
            &mdash;
            <time class="event__end-time" datetime="${point.dateTo.toISOString()}">${timeTo}</time>
          </p>
          <p class="event__duration">${tripDuration}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${point.basePrice}</span>
        </p>
        ${createOffersTemplate(selectedOffers)}
        <button class="event__favorite-btn ${favoriteClassName}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `;
}

export default class EventView extends AbstractView {
  #point;
  #destinations;
  #offers;

  constructor(point, destinations, offers) {
    super();
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createEventTemplate(this.#point, this.#destinations, this.#offers);
  }

  setEditClickHandler(callback) {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', callback);
  }

  setFavoriteClickHandler(callback) {
    this.element
      .querySelector('.event__favorite-btn')
      .addEventListener('click', (evt) => {
        evt.preventDefault();
        callback();
      });
  }
}
