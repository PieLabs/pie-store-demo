import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    display: block;
  } 
  textarea, input, button { outline: none; }

  input[type="text"],
  input[type="password"]{
    background-color: transparent;
    border: none;
    border-bottom: solid 1px var(--color-primary);
    padding: 10px 0 10px 0;
  }
  input[type="text"]:focus,
  input[type="password"]:focus{
    border-bottom: solid 1px var(--color-secondary);
  }

  </style>
  <input type="text" id="name" placeholder="name"></input>
  <br/>
  <br/>
  <input type="submit"></input>
`;
const template = prepareTemplate(html, 'session-editor');

export default class StudentIdForm extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$submit = sr.querySelector('input[type="submit"]');
    this._$name = sr.querySelector('#name');
  }

  connectedCallback() {
    this._$submit.addEventListener('click', e => {

      this.dispatchEvent(new CustomEvent('submit', {
        bubbles: true,
        composed: true,
        detail: {
          name: this._$name.value
        }
      }))
    });
  }
}