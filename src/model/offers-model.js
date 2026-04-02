import { OFFERS } from '../mock/point.js';

export default class OffersModel {
  #offers = OFFERS;

  getOffers() {
    return this.#offers;
  }
}
