export default class EventListView {
  getTemplate() {
    return `
    <ul class="trip-events__list"></ul>
    `;
  }

  getElement() {
    if (!this.element) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getTemplate();
      this.element = wrapper.firstElementChild;
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
