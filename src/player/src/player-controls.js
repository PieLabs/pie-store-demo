import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';
const html = `
<span>
  <button id="submit">submit</button>
</span>
`;

const template = prepareTemplate(html, 'player-controls');

export default class PlayerControls extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$submit = sr.querySelector('#submit');
  }

  connectedCallback() {
    this._$submit.addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('player-controls.submit', { composed: true, bubbles: true }));
    });
  }
}