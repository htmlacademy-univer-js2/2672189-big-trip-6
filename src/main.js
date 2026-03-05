import TripPresenter from './presenter/trip-presenter.js';

const mainContainer = document.querySelector('.trip-events');
const filterContainer = document.querySelector('.trip-controls__filters');

const presenter = new TripPresenter(mainContainer, filterContainer);
presenter.init();
