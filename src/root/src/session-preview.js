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
.student{
  font-size: 24px;
  border-bottom: solid 1px var(--catalog-header-bg, blue);
  padding-bottom: 10px;
}

pie-player{
  display: block; 
  padding-top: 10px;
  margin-top: 10px;
}

</style>
<div class="student" hidden></div>

<pie-player></pie-player>
`;

const template = prepareTemplate(html, 'session-preview');

export default class SessionPreview extends HTMLElement {
  constructor() {
    super();
    applyStyle(this, template, false);
    this._$player = this.querySelector('pie-player');
    this._$student = this.querySelector('.student');
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

    if (s) {
      this._$student.removeAttribute('hidden');
    } else {
      this._$student.setAttribute('hidden', '');
    }

    if (!this.controller) {
      return;
    }

    this._$student.textContent = s.studentId;
    this._$player.env({ mode: s.isComplete ? 'evaluate' : 'view' })
      .then(() => {
        this._$player.sessions(s.answers);
      });
  }

}
