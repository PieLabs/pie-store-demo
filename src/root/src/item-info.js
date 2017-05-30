import { AjaxFailedEvent, AjaxResultEvent } from './ajax-link';
import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<style> 
  .main {
    display: flex;
  }
</style>
<div class="main">
<session-listing></session-listing>
<slot>
</slot>
</div>
<div class="actions">
</div>`;

const template = prepareTemplate(html, 'item-info');

export default class ItemInfo extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
    /**
     * Need to render player in the light dom.
     */
    this.innerHTML = `<session-preview></session-preview>`;
    this._$actions = sr.querySelector('.actions');
    this._$sessionListing = sr.querySelector('session-listing');
    this._$sessionPreview = this.querySelector('session-preview');
    this._$sessionListing.addEventListener('show-session', e => {
      this._$sessionPreview.showSession(e.detail.session);
    });
  }

  set item(i) {
    this._item = i;
    this._$sessionPreview.item = this._item;
    this._render();
  }

  set endpoints(e) {
    this._endpoints = e;
    this._$sessionPreview.endpoints = e;
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

    this._$sessionListing.sessions = this._item.sessions;
  }

  _renderEndpoints() {

    if (!this._item || !this._endpoints) {
      return;
    }

    let markup = ``;

    const { partake } = this._endpoints.views;
    markup += `<a href="${partake.replace(':itemId', this._item._id)}" target="_blank">test url to share</a>`;

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