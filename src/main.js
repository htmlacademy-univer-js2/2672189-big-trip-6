import ApiService from './framework/api-service.js';
import { render } from './framework/render.js';
import EmptyView from './view/empty-view.js';
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

async function initApp() {
  try {
    const points = await apiService.getPoints();
    const [destinationsResult, offersResult] = await Promise.allSettled([
      apiService.getDestinations(),
      apiService.getOffers(),
    ]);

    pointsModel.setPoints(points);

    if (destinationsResult.status === 'fulfilled') {
      destinationsModel.setDestinations(destinationsResult.value);
    }

    if (offersResult.status === 'fulfilled') {
      offersModel.setOffers(offersResult.value);
    }

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
