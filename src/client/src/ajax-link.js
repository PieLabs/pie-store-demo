import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

export class AjaxResultEvent extends CustomEvent {

  static TYPE() {
    return 'ajax-link.result';
  }

  constructor(method, url, data) {
    super(AjaxResultEvent.TYPE(), {
      bubbles: true,
      details: {
        method,
        url,
        data
      }
    });
  }
}

export class AjaxFailedEvent extends CustomEvent {

  static TYPE() {
    return 'ajax-link.failed';
  }

  constructor(method, url, error) {
    super(AjaxFailedEvent.TYPE(), {
      bubbles: true,
      details: {
        method,
        url,
        error
      }
    });
  }
}

const html = `
<style>
:host {
  cursor: pointer;
}
</style>
<div id="label">label</div>`;

const template = prepareTemplate(html, 'item-info');

export default class AjaxLink extends HTMLElement {

  constructor() {
    super();
    applyStyle(this, template);
  }

  connectedCallback() {
    this.shadowRoot.querySelector('#label').textContent = this.getAttribute('label');

    const method = this.getAttribute('method');
    const url = this.getAttribute('url');

    this.addEventListener('click', (e) => {
      fetch({
        method,
        url
      })
        .then(r => r.json())
        .then(j => {
          this.dispatchEvent(new AjaxResultEvent(method, url, j))
        })
        .catch(e => {
          this.dispatchEvent(new AjaxFailedEvent(method, url, e))
        })
    });
  }

}