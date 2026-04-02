import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';

const headerContainer = document.querySelector('.trip-main');
const filterContainer = document.querySelector('.trip-controls__filters');
const mainContainer = document.querySelector('.trip-events');

const pointsModel = new PointsModel();

const tripPresenter = new TripPresenter({
  headerContainer,
  filterContainer,
  mainContainer,
  pointsModel,
});

tripPresenter.init();
