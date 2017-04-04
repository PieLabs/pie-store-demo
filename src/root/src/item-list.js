import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <h5>Item List</h5>
  <div id="holder"></div>
`;

const template = prepareTemplate(html, 'item-list');

export default class ItemList extends HTMLElement {
  constructor() {
    super();
    applyStyle(this, template);
  }

  set items(i) {
    this._items = i;
    this._render();
  }

  _render() {
    const itemsMarkup = (this._items || []).map(i => `<a href="/items/${i._id}">${i._id}</a>`).join('\n');
    this.shadowRoot.querySelector('#holder').innerHTML = itemsMarkup;
  }
}