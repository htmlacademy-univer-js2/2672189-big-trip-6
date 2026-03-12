import { generateRoutePoint, DESTINATIONS, OFFERS } from '../mock/point.js';

export default class PointsModel {
  constructor() {
    this.points = Array.from({ length: 5 }, generateRoutePoint);
    this.destinations = DESTINATIONS;
    this.offers = OFFERS;
  }

  getPoints() {
    return this.points;
  }

  getDestinations() {
    return this.destinations;
  }

  getOffers() {
    return this.offers;
  }
}
