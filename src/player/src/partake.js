require('../../client-common/common');

import StudentIdForm from './student-id-form';

customElements.define('student-id-form', StudentIdForm);

const init = () => {
  const container = document.querySelector('catalog-container');
  container.isLoading(false);
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}