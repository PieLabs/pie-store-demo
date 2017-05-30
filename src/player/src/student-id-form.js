import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
  <style>
  :host {
    display: block;
  } 

  </style>
  <div>
    <label>Name: 
    <input type="text" id="name" placeholder="name"></input>
    </label>
    <button id="submit">submit</button>
  </div>
`;
const template = prepareTemplate(html, 'session-editor');

export default class StudentIdForm extends HTMLElement {

  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$submit = sr.querySelector('#submit');
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