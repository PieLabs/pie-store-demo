import { applyStyle, prepareTemplate } from 'pie-catalog-client/src/styles';

const html = `
<style>
:host {
  display: block;
}

input{
  margin: 10px;
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

.error{
  color: red;
  font-size: 11px;
  margin: 10px;
}
</style>
<form>
  <input type="text" name="username" placeholder="username"></input>
  <br/>
  <input type="password" name="password" placeholder="password"></input>
  <br/>
  <input type="submit"></input>
  <br/>
  <label class="error"></label>
</form>
`;

const template = prepareTemplate(html, 'login-form');

export default class LoginForm extends HTMLElement {

  static get observedAttributes() {
    return ['error'];
  }

  constructor() {
    super();
    let sr = applyStyle(this, template);
    this._$form = sr.querySelector('form');
    this._$error = sr.querySelector('.error');
  }

  set method(m) {
    this._$form.setAttribute('method', m);
  }

  set action(a) {
    this._$form.setAttribute('action', a);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'error') {
      this._renderError(newValue);
    }
  }

  connectedCallback() {
    this._renderError(this.getAttribute('error'));
  }

  _renderError(e) {
    if (e) {
      this._$error.textContent = e;
    } else {
      this._$error.textContent = '';
    }
  }
}