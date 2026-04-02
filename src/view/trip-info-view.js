import AbstractView from '../framework/view/abstract-view.js';

function createTripInfoTemplate() {
  return `
    <section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">Amsterdam — Geneva — Chamonix</h1>
        <p class="trip-info__dates">Mar 21 — Mar 29</p>
      </div>
      <p class="trip-info__cost">
        Total: €&nbsp;<span class="trip-info__cost-value">8384</span>
      </p>
    </section>
  `;
}

export default class TripInfoView extends AbstractView {
  get template() {
    return createTripInfoTemplate();
  }
}
