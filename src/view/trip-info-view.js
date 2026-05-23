import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

function formatDate(date) {
  return dayjs(date).format('MMM DD');
}

function createTripInfoTemplate(tripDates = {}) {
  const { dateFrom, dateTo } = tripDates;

  return `
    <section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">Amsterdam — Geneva — Chamonix</h1>
        <p class="trip-info__dates">${dateFrom && dateTo ? `${formatDate(dateFrom)} — ${formatDate(dateTo)}` : ''}</p>
      </div>
      <p class="trip-info__cost">
        Total: €&nbsp;<span class="trip-info__cost-value">8384</span>
      </p>
    </section>
  `;
}

export default class TripInfoView extends AbstractView {
  #tripDates;

  constructor(tripDates = {}) {
    super();
    this.#tripDates = tripDates;
  }

  get template() {
    return createTripInfoTemplate(this.#tripDates);
  }
}
