import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<style>
:host {
  padding: 10px;
}
</style>
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>no of sessions</th>
      <th>actions</th>
    </tr>
  </thead>
  <tbody>
  <tbody>
</table>
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
    (this._items || []).forEach(i => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i.name}</td>
      <td>no of sessions</td>
      <td> 
      <a href="/items/${i._id}">view</a>
      </td>`;
      this.shadowRoot.querySelector('tbody').appendChild(tr);
    });
  }
}