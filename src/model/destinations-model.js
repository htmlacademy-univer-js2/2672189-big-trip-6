export default class DestinationsModel {
  #destinations = [];

  getDestinations() {
    return this.#destinations;
  }

  setDestinations(destinations) {
    this.#destinations = structuredClone(destinations);
  }
}
