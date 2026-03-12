import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';

const mainContainer = document.querySelector('.trip-events');
const filterContainer = document.querySelector('.trip-controls__filters');
const pointsModel = new PointsModel();

const presenter = new TripPresenter({
  mainContainer,
  filterContainer,
  pointsModel
});
presenter.init();
