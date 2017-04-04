require('../../client-common/common');

import AjaxLink from './ajax-link';
import ItemInfo from './item-info';

customElements.define('item-info', ItemInfo);
customElements.define('ajax-link', AjaxLink);

const init = () => {
  const container = document.querySelector('catalog-container');
  container.isLoading(false);
  const el = document.querySelector('item-info');
  el.item = window._pieStore.item;
  el.endpoints = window._pieStore.endpoints;
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}