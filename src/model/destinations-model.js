import { DESTINATIONS } from '../mock/point.js';

export default class DestinationsModel {
  #destinations = DESTINATIONS;

  getDestinations() {
    return this.#destinations;
  }
}
