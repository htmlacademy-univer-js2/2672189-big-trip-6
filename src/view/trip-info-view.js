import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

function formatDate(date) {
  return dayjs(date).format('MMM DD');
}

function createTripInfoTemplate(tripInfo = {}) {
  const { dateFrom, dateTo, title = '', cost = 0 } = tripInfo;

  return `
    <section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${title}</h1>
        <p class="trip-info__dates">${dateFrom && dateTo ? `${formatDate(dateFrom)} — ${formatDate(dateTo)}` : ''}</p>
      </div>
      <p class="trip-info__cost">
        Total: €&nbsp;<span class="trip-info__cost-value">${cost}</span>
      </p>
    </section>
  `;
}

export default class TripInfoView extends AbstractView {
  #tripInfo;

  constructor(tripInfo = {}) {
    super();
    this.#tripInfo = tripInfo;
  }

  get template() {
    return createTripInfoTemplate(this.#tripInfo);
  }
}
