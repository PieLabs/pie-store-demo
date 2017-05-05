import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    display: block;
  } 

  #header{
    margin-top: 10px;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(0,0,0,0.1);
  }

  #header > * {
    margin: 10px;
  }

  </style>
  <div id="header">
    <label id="title">Error Log</label>
    <button id="clear">clear</button>
  </div>
  <div id="log"></div>
`;
const template = prepareTemplate(html, 'error-log');

export default class ErrorLog extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$log = sr.querySelector('#log');
    this._$button = sr.querySelector('#clear');
  }

  connectedCallback() {
    this._$button.addEventListener('click', e => {
      this._$log.innerHTML = ``;
    });
  }

  addError(e) {
    const log = document.createElement('div');
    log.textContent = `${new Date()} - ${e.message}`;
    this._$log.appendChild(log);
  }
}