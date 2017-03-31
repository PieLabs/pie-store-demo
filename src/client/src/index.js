console.log('index.js');

import CatalogContainer from 'pie-catalog-client/src/catalog-container';
import CatalogFooter from 'pie-catalog-client/src/footer';
import CatalogHeader from 'pie-catalog-client/src/header';
import ItemList from './item-list';
import PieBrand from 'pie-catalog-client/src/pie-brand';
import ProgressBar from 'pie-catalog-client/src/progress-bar';

customElements.define('pie-brand', PieBrand); 
customElements.define('progress-bar', ProgressBar);
customElements.define('catalog-header', CatalogHeader);
customElements.define('catalog-footer', CatalogFooter);
customElements.define('catalog-container', CatalogContainer);
customElements.define('item-list', ItemList);



const init = () => {
  console.log('init..');

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