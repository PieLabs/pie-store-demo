import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<span>
  <button id="submit" title="saves answers, and sets isComplete to true">submit</button>
  |
  <button data-event="switch-mode" data-mode="gather">gather</button>
  <button data-event="switch-mode" data-mode="view">view</button>
  <button data-event="switch-mode" data-mode="evaluate">evaluate</button>
  |
  <button id="get-outcome">get outcome</button>
  <button id="get-status">status</button> 
  | 
  <button id="reset">reset</button>
  <button id="reset-response">reset response</button>
</span>
`;

const template = prepareTemplate(html, 'player-controls');

export default class PlayerControls extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
  }

  connectedCallback() {
    console.log('connected');
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