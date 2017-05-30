require('../../client-common/common');

import AjaxLink from './ajax-link';
import ItemInfo from './item-info';
import PiePlayer from 'pie-player';
import SessionListing from './session-listing';
import SessionPreview from './session-preview';

customElements.define('item-info', ItemInfo);
customElements.define('ajax-link', AjaxLink);
customElements.define('session-listing', SessionListing);
customElements.define('session-preview', SessionPreview);
customElements.define('pie-player', PiePlayer);

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