require('./login.less');

require('../../client-common/common');

import LoginForm from './login-form';
customElements.define('login-form', LoginForm);

const init = () => {
  const loginForm = document.querySelector('login-form');
  loginForm.method = 'post';
  loginForm.action = '/login';
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}