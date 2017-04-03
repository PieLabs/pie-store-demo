import { AjaxFailedEvent, AjaxResultEvent } from './ajax-link';
import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<div>Item Info </div>
<div id="sessions">no sessions</div>
<span id="session-actions">
</span>`;

const template = prepareTemplate(html, 'item-info');

export default class ItemInfo extends HTMLElement {
  constructor() {
    super();
    applyStyle(this, template);
    this._$actions = this.shadowRoot.querySelector('#session-actions');
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
    this._renderEndpoints();
  }

  _renderEndpoints() {

    if (!this._item || !this._endpoints) {
      return;
    }

    let markup = ``;

    for (var x in this._endpoints.session) {
      const v = this._endpoints.session[x];
      console.log(this._item.id);
      const url = v.url.replace(':itemId', this._item._id);
      console.log('url:', url);
      const el = `<ajax-link label="${x}" method="${v.method}" url="${v.url}"></ajax-link>`;
      markup += el;
    }

    this._$actions.innerHTML = markup;

    this.addEventListener(AjaxResultEvent.TYPE(), (e) => {
      console.log('ajax call result', e)
    });

    this.addEventListener(AjaxFailedEvent.TYPE(), (e) => {
      console.log('ajax call failed', e.detail.error)
    });
  }
}