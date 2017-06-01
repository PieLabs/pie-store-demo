import { AjaxFailedEvent, AjaxResultEvent } from './ajax-link';
import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

import dateformat from 'dateformat';

const html = `
<style>
:host{
  display: block;
  width: 100%;
}

.action{
  cursor: pointer;
  color: blue;
}
.action:hover{
  text-decoration: underline;
}

table{
  width: 100%;
}

th{
  text-align: left;
  background-color: var(--color-primary-light);
}
td, th{
  padding: 10px 10px 10px 0;
}

th {
  border-bottom: solid 1px var(--session-listing-th-border-color, red);
}
tr{
  transition: background-color linear 200ms;
}

tr:hover{
  background-color: rgba(200,200,200,0.8);
}

tr.selected{
  background-color: var(--color-primary);
}
</style>
<table>
  <thead>
    <tr>
    <th>student</th>
    <th>completed</th>
    <th>score</th>
    <th>date</th>
    <th>duration</th>
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
    if (this._sessions && this._sessions.length > 0) {
      this.actionClick(this._sessions[0]._id);
    }
  }

  actionClick(sessionId) {
    const session = this._sessions.find(s => s._id === sessionId);
    this._activeSession = sessionId;
    this.dispatchEvent(new CustomEvent('show-session', {
      bubbles: true,
      composed: true,
      detail: {
        session
      }
    }));
    this.updateUi();
  }

  sudoClick(sessionId) {

    this.dispatchEvent(new CustomEvent('launch-sudo-player', {
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
      tr.setAttribute('class', s._id === this._activeSession ? 'selected' : '');
      const started = s.started ? dateformat(new Date(s.started), 'yyyy/mm/dd HH:MM:ss') : null;
      const completed = s.completed ? new Date(s.completed) : null;
      const duration = (started && completed) ? ((completed.getTime() - new Date(s.started).getTime()) / 1000) : 'n/a';

      tr.innerHTML = `
      <td>${s.studentId}</td> 
      <td>${s.isComplete}</td>
      <td>${s.outcome ? `${s.outcome.summary.percentage}%` : ''}</td>
      <td>${started || 'n/a'}</td>
      <td>${duration !== 'n/a' ? `${duration} seconds` : 'n/a'}</td>
      <td>
      <span class="action" data-action="show" data-session-id="${s._id}">show</a>
      <a href="/player/${s._id}/super-user" target="_blank">sudo</a>
      </td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.action').forEach(n => {
      n.addEventListener('click', e => {
        const action = e.target.getAttribute('data-action');
        const sessionId = e.target.getAttribute('data-session-id');
        switch (action) {
          case 'show': this.actionClick(sessionId);
            break;
        }
      });
    })
  }
}
