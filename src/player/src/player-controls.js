import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';
const html = `
<span>
  <button id="submit" title="saves answers, and sets isComplete to true">submit</button>
  |
  <button id="gather">gather</button>
  <button id="view">view</button>
  <button id="evaluate">evaluate</button>
</span>
`;

const switchMode = (mode) => {
  return new CustomEvent('player-controls.switch-mode', {
    composed: true,
    bubbles: true,
    detail: { mode }
  });
}

const template = prepareTemplate(html, 'player-controls');

export default class PlayerControls extends HTMLElement {
  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$submit = sr.querySelector('#submit');
    this._$gather = sr.querySelector('#gather');
    this._$view = sr.querySelector('#view');
    this._$evaluate = sr.querySelector('#evaluate');
  }

  connectedCallback() {
    this._$submit.addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('player-controls.submit', { composed: true, bubbles: true }));
    });

    this._$view.addEventListener('click', e => {
      this.dispatchEvent(switchMode('view'))
    });

    this._$gather.addEventListener('click', e => {
      this.dispatchEvent(switchMode('gather'))
    });

    this._$evaluate.addEventListener('click', e => {
      this.dispatchEvent(switchMode('evaluate'))
    });
  }
}