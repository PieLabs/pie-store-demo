import { AjaxFailedEvent, AjaxResultEvent } from './ajax-link';
import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<style>
:host{
  display: flex;
}

.action{
  cursor: pointer;
  color: blue;
}
</style>
<table>
  <thead>
    <tr>
    <th>student</th>
    <th>completed</th>
    <th>actions</th>
  </tr>
  </thead>
  <tbody>
  </tbody>
</table>`;

const template = prepareTemplate(html, 'session-listing');

export default class SessionListing extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$table = sr.querySelector('table');
  }

  set sessions(s) {
    this._sessions = s;
    this.updateUi();
  }

  actionClick(target) {
    const sessionId = target.getAttribute('data-session-id');
    const session = this._sessions.find(s => s._id === sessionId);
    this.dispatchEvent(new CustomEvent('show-session', {
      bubbles: true,
      composed: true,
      detail: {
        session
      }
    }));
  }

  updateUi() {
    const tbody = this._$table.querySelector('tbody');
    tbody.innerHTML = '';
    this._sessions.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
      <td>${s.studentId}</td> 
      <td>${s.isComplete}</td>
      <td><span class="action" data-session-id="${s._id}">show</a></td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.action').forEach(n => {
      n.addEventListener('click', e => {
        this.actionClick(e.target);
      });
    })
  }
}
