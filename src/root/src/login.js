require('../../client-common/common');

console.log('login!');



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