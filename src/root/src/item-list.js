import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<style>
:host {
  display: block;
  width: 100%;
  padding: 0;
  margin: 0;
}
table{
  width: 100%;
}

th{
  text-align: left;
  background-color: var(--item-list-th-bg-color, black);
  color: var(--item-list-th-color, red);
  padding: 10px;
}

td{
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
      <td>${i.sessionCount}</td>
      <td> 
      <a href="/items/${i._id}">view</a>
      </td>`;
      this.shadowRoot.querySelector('tbody').appendChild(tr);
    });
  }
}