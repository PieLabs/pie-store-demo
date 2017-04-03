require('./common');

import PiePlayer from 'pie-player';
import PieStoreController from './pie-store-controller';
customElements.define('pie-player', PiePlayer);


const init = () => {
  const container = document.querySelector('catalog-container');
  container.isLoading(false);

  customElements.whenDefined('pie-player')
    .then(() => {
      const player = document.querySelector('pie-player');
      window._pieStore.session.answers = window._pieStore.session.answers || [];
      player.session = window._pieStore.session.answers;
      player.controller = new PieStoreController(window._pieStore.endpoints.controller);
      player.env = { mode: 'gather' };
    })
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}