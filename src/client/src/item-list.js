import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <h1>Item List</h1>
`;

const template = prepareTemplate(html, 'item-list');

export default class ItemList extends HTMLElement {
  constructor() {
    super();
    applyStyle(this, template);
  }
}