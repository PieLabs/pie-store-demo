require('../../client-common/common');
require('./item.less');

import AjaxLink from './ajax-link';
import CenteredContent from './centered-content';
import ItemInfo from './item-info';
import PiePlayer from 'pie-player';
import SessionListing from './session-listing';
import SessionPreview from './session-preview';
import StoreHeader from './store-header';

customElements.define('store-header', StoreHeader);
customElements.define('centered-content', CenteredContent);

customElements.define('item-info', ItemInfo);
customElements.define('ajax-link', AjaxLink);
customElements.define('session-listing', SessionListing);
customElements.define('session-preview', SessionPreview);
customElements.define('pie-player', PiePlayer);

const init = () => {
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