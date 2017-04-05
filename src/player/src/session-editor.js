import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    display: block;
  } 

  </style>
  <code-editor></code-editor>
  <div>
    <button id="save">save</button>
  </div>
`;
const template = prepareTemplate(html, 'session-editor');

export default class SessionEditor extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$editor = sr.querySelector('code-editor');
    this._$saveButton = sr.querySelector('#save');
  }

  connectedCallback() {

    this._$saveButton.addEventListener('click', e => {
      this.dispatchEvent(new CustomEvent('update-session', {
        bubbles: true,
        composed: true,
        detail: {
          session: this._session
        }
      }));
    });

    this._$editor.addEventListener('code-editor.change', e => {
      this._session = e.detail.content;
    });
  }

  set session(s) {
    this._session = s;
    this._$editor.content = this._session;
  }
}