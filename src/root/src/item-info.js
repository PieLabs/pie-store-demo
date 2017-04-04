import { AjaxFailedEvent, AjaxResultEvent } from './ajax-link';
import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<div>Item Info </div>
<h4>Sessions</h4>
<div id="sessions">no sessions</div>
<hr/>
<span id="session-actions">
</span>`;

const template = prepareTemplate(html, 'item-info');

export default class ItemInfo extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$actions = sr.querySelector('#session-actions');
    this._$sessions = sr.querySelector('#sessions');
  }

  set item(i) {
    this._item = i;
    this._render();
  }

  set endpoints(e) {
    this._endpoints = e;
    this._render();
  }

  _render() {

    this._renderSessions();
    this._renderEndpoints();
  }

  _renderSessions() {
    if (!this._endpoints) {
      return;
    }

    if (this._item.sessions.length > 0) {
      let markup = this._item.sessions.map((s) => {
        const { _id } = s;
        const player = this._endpoints.views.loadPlayer.replace(':sessionId', _id);
        const editSession = this._endpoints.views.editSession.replace(':sessionId', _id);
        const deleteSession = this._endpoints.session.delete.url.replace(':sessionId', _id);
        return `<span>${_id} | <a href="${player}">player</a> |
      <a href="${editSession}">edit</a></span> | 
      <ajax-link url="${deleteSession}" session-id="${_id}" method="delete" label="delete"></ajax-link>`;
      }).join('<br/>');

      this._$sessions.innerHTML = markup;

      this._$sessions.querySelectorAll('ajax-link').forEach(el => {
        el.addEventListener(AjaxResultEvent.TYPE(), (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          const id = event.target.getAttribute('session-id');
          const index = this._item.sessions.findIndex(o => o._id === id);
          this._item.sessions.splice(index, 1);
          this._renderSessions();
        });
      })
    }
  }

  _renderEndpoints() {

    if (!this._item || !this._endpoints) {
      return;
    }

    let markup = ``;

    const { create } = this._endpoints.session;
    const url = create.url.replace(':itemId', this._item._id);
    const el = `<ajax-link label="create" method="${create.method}" url="${url}"></ajax-link>`;
    markup += el;

    this._$actions.innerHTML = markup;

    this.addEventListener(AjaxResultEvent.TYPE(), (e) => {
      this._item.sessions.push(e.detail.data);
      this._renderSessions();
    });

    this.addEventListener(AjaxFailedEvent.TYPE(), (e) => {
      console.log('ajax call failed', e.detail.error)
    });
  }
}