import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    padding-top: 10px;
  } 

  .row {
    display: flex;
    background-color: var(--color-primary);
  }
  .row > div {
    padding: 10px;
  }
  </style>
  <div class="row">
    <div>Percentage: <span class="percentage"></span></div>
    <div>Max Points: <span class="max"></span></div>
    <div>Points: <span class="points"></span></div>
  </div>
`;


const template = prepareTemplate(html, 'session-outcome');

export default class SessionOutcome extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$percentage = sr.querySelector('.percentage');
    this._$max = sr.querySelector('.max');
    this._$points = sr.querySelector('.points');
  }

  set outcome(o) {
    this._outcome = o;
    if (o) {
      this.removeAttribute('hidden');
      this.style.display = 'block';
    } else {
      this.setAttribute('hidden', 'hidden');
    }

    this._$percentage.textContent = `${o.summary.percentage}%`;
    this._$points.textContent = o.summary.score;
    this._$max.textContent = o.summary.max;
  }
  connectedCallback() {

  }
}