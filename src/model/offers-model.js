export default class OffersModel {
  #offers = [];

  getOffers() {
    return this.#offers;
  }

  setOffers(offers) {
    this.#offers = structuredClone(offers);
  }
}
