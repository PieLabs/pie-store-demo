import { AjaxFailedEvent, AjaxResultEvent } from './ajax-link';
import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

import RemoteController from '../../player/src/pie-store-controller';

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
<div>Session preview</div>
<pie-player></pie-player>
`;

const template = prepareTemplate(html, 'session-preview');

export default class SessionPreview extends HTMLElement {
  constructor() {
    super();
    applyStyle(this, template, false);
    this._$player = this.querySelector('pie-player');
    customElements.whenDefined('pie-player')
      .then(() => {
        this._$player.env({ mode: 'evaluate' });

      });
  }

  set item(i) {
    this._item = i;
    this._$player.innerHTML = this._item.markup;
  }

  set endpoints(e) {
    this.controller = new RemoteController(e);
    this._$player.controller = this.controller;
  }

  showSession(s) {
    if (!this.controller) {
      return;
    }

    this._$player.sessions(s.answers)
    // .then(() => {
    //   this._$player.env({ mode: 'evaluate' });
    // });
  }

}
