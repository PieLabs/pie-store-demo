import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

export class AjaxResultEvent extends CustomEvent {

  static TYPE() {
    return 'ajax-link.result';
  }

  constructor(method, url, data) {
    super(AjaxResultEvent.TYPE(), {
      bubbles: true,
      composed: true,
      detail: {
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
      composed: true,
      detail: {
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
  display: inline;
}
</style>
<span id="label">label</span>`;

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
      fetch(url, { method, body: {} })
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