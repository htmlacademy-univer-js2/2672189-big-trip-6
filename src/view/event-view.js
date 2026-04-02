import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { DESTINATIONS, OFFERS } from '../mock/point.js';

dayjs.extend(duration);

function getDestination(point) {
  return DESTINATIONS.find((d) => d.id === point.destination);
}

function getOffersForPoint(point) {
  const offersByType = OFFERS.find((offer) => offer.type === point.type);
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

  const days = d.days();
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
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
    </li>`
  ).join('');

  return `
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <ul class="event__selected-offers">
        ${items}
      </ul>
    </section>
  `;
}

function createEventTemplate(point) {
  const destination = getDestination(point);
  const offers = getOffersForPoint(point);

  const dateFrom = formatDate(point.dateFrom);
  const timeFrom = formatTime(point.dateFrom);
  const timeTo = formatTime(point.dateTo);
  const tripDuration = formatDuration(point.dateFrom, point.dateTo);

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${dayjs(point.dateFrom).format('YYYY-MM-DD')}">${dateFrom}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${point.type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${point.type} ${destination?.name ?? ''}</h3>
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
        ${createOffersTemplate(offers)}
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `;
}

export default class EventView extends AbstractView {
  #point;

  constructor(point) {
    super();
    this.#point = point;
  }

  get template() {
    return createEventTemplate(this.#point);
  }

  setEditClickHandler(callback) {
    this.element
      .querySelector('.event__rollup-btn')
      .addEventListener('click', callback);
  }
}
