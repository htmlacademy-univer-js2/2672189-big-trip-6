import { render } from '../render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';
export default class TripPresenter {
  constructor({ mainContainer, filterContainer, pointsModel }) {
    this.mainContainer = mainContainer;
    this.filterContainer = filterContainer;
    this.pointsModel = pointsModel;
    this.eventListComponent = new EventListView();
  }

  init() {
    const points = this.pointsModel.getPoints();
    render(new FilterView(), this.filterContainer);
    render(new SortView(), this.mainContainer);
    render(this.eventListComponent, this.mainContainer);
    render(
      new EventEditView(points[0]),
      this.eventListComponent.getElement()
    );
    for (let i = 1; i < points.length; i++) {
      render (
        new EventView(points[i]),
        this.eventListComponent.getElement()
      );
    }
  }
}
