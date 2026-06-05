import ApiService from './framework/api-service.js';
import { render } from './framework/render.js';
import EmptyView from './view/empty-view.js';
import LoadingView from './view/loading-view.js';
import TripPresenter from './presenter/trip-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';

const headerContainer = document.querySelector('.trip-main');
const filterContainer = document.querySelector('.trip-controls__filters');
const mainContainer = document.querySelector('.trip-events');

function getAuthorization() {
  return `Basic ${Math.random().toString(36).slice(2)}`;
}

const apiService = new ApiService('https://24.objects.htmlacademy.pro/big-trip', getAuthorization());
const pointsModel = new PointsModel(apiService);
const destinationsModel = new DestinationsModel();
const offersModel = new OffersModel();
const filterModel = new FilterModel();
const addButtonElement = headerContainer.querySelector('.trip-main__event-add-btn');

render(new LoadingView(), mainContainer);
addButtonElement.disabled = true;

async function initApp() {
  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const points = await apiService.getPoints();
    const [destinations, offers] = await Promise.all([
      apiService.getDestinations(),
      apiService.getOffers(),
    ]);

    pointsModel.setPoints(points);
    destinationsModel.setDestinations(destinations);
    offersModel.setOffers(offers);

    const filterPresenter = new FilterPresenter({
      filterContainer,
      filterModel,
      pointsModel,
    });

    const tripPresenter = new TripPresenter({
      headerContainer,
      mainContainer,
      pointsModel,
      filterModel,
      destinationsModel,
      offersModel,
    });

    filterPresenter.init();
    tripPresenter.init();
  } catch (error) {
    mainContainer.querySelector('.trip-events__msg')?.remove();
    render(new EmptyView('Failed to load latest route information'), mainContainer);
  }
}

initApp();
