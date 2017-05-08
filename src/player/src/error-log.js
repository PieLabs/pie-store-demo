import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

import dateformat from 'dateformat';

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

  .error::before{
    color: red;
    content: '[ERROR] ';
  }
  
  .info::before{
    color: blue;
    content: '[INFO] ';
  }

  </style>
  <div id="header">
    <label id="title">Log</label>
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
    this.format = (now) => dateformat(now, "h:MM:ss TT");
  }

  connectedCallback() {
    this._$button.addEventListener('click', e => {
      this._$log.innerHTML = ``;
    });
  }

  log(level, ...args) {
    const log = document.createElement('div');
    log.setAttribute('class', level);

    const msg = args.map(a => {
      if (typeof a === 'string') {
        return a;
      } if (a instanceof Error) {
        return a.message;
      } else {
        return JSON.stringify(a);
      }
    }).join(' ');

    log.textContent = `${this.format(new Date())} - ${msg}`;

    this._$log.appendChild(log);
  }

  error(e) {
    this.log('error', e);
  }

  info(...args) {
    this.log('info', ...args);
  }
}