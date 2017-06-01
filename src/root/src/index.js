require('../../client-common/common');
require('./index.less');

import CenteredContent from './centered-content';
import ItemList from './item-list';
import StoreHeader from './store-header';

customElements.define('item-list', ItemList);
customElements.define('store-header', StoreHeader);
customElements.define('centered-content', CenteredContent);

const init = () => {
  document.querySelector('item-list').items = window._pieStore.items;
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}