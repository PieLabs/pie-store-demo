require('./common');

import ItemList from './item-list';

customElements.define('item-list', ItemList);

const init = () => {
  console.log('init..');
  const container = document.querySelector('catalog-container');
  container.isLoading(false);
  document.querySelector('item-list').items = window._pieStore.items;
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}