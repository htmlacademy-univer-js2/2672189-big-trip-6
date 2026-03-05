import { render } from '../render.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import EventListView from '../view/event-list-view.js';
import EventView from '../view/event-view.js';
import EventEditView from '../view/event-edit-view.js';
export default class TripPresenter {
  constructor(mainContainer, filterContainer) {
    this.mainContainer = mainContainer;
    this.filterContainer = filterContainer;
    this.eventListComponent = new EventListView();
  }

  init() {
    render(new FilterView(), this.filterContainer);
    render(new SortView(), this.mainContainer);
    render(this.eventListComponent, this.mainContainer);
    render(new EventEditView(), this.eventListComponent.getElement());
    render(new EventView(), this.eventListComponent.getElement());
    render(new EventView(), this.eventListComponent.getElement());
    render(new EventView(), this.eventListComponent.getElement());
  }
}
