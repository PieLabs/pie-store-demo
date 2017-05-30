require('../../client-common/common');

import {
  jsonHeaders as headers,
  json,
  status,
} from '../../client-common/fetch-helpers';

import StudentIdForm from './student-id-form';

customElements.define('student-id-form', StudentIdForm);

const init = () => {
  const container = document.querySelector('catalog-container');
  container.isLoading(false);

  customElements.whenDefined('student-id-form')
    .then(() => {
      const form = document.querySelector('student-id-form');
      form.addEventListener('submit', e => {

        const { registerStudent } = _pieStore.endpoints;
        const opts = {
          method: registerStudent.method,
          headers,
          body: JSON.stringify({
            name: e.detail.name
          })
        }

        fetch(registerStudent.url, opts)
          .then(r => r.json())
          .then(result => {
            console.log('result.url:', result.url);
            window.location.href = result.url;
          });
      });
    })
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}