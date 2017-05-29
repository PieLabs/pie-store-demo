import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<span>
  <button id="submit" disabled="disabled" title="saves answers, and sets isComplete to true">submit</button>
  |
  <button data-event="switch-mode" data-mode="gather">gather</button>
  <button data-event="switch-mode" data-mode="view">view</button>
  <button data-event="switch-mode" data-mode="evaluate">evaluate</button>
  |
  <button id="get-outcome">get outcome</button>
  <button id="get-status">status</button> 
</span>
`;

const template = prepareTemplate(html, 'player-controls');

export default class PlayerControls extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
  }

  set canSubmit(c) {
    this._canSubmit = c;
    const $submit = this.shadowRoot.querySelector('#submit');

    if (this._canSubmit) {
      $submit.removeAttribute('disabled');
    } else {
      $submit.setAttribute('disabled', 'disabled');
    }
  }

  connectedCallback() {
    this.shadowRoot.querySelectorAll('button').forEach(n => {
      console.log('node: ', n);
      const id = n.getAttribute('id');
      const event = n.getAttribute('data-event') || id;

      n.addEventListener('click', e => {
        const detail = event === 'switch-mode' ? {
          mode: n.getAttribute('data-mode')
        } : {};

        this.dispatchEvent(new CustomEvent(`player-controls.${event}`, {
          composed: true,
          bubbles: true,
          detail
        }));
      });
    });
  }
}