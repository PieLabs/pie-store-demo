require('../../client-common/common');

import PiePlayer from 'pie-player';
import PieStoreController from './pie-store-controller';
import PlayerControls from './player-controls';
import SessionClient from './session-client';

customElements.define('pie-player', PiePlayer);
customElements.define('player-controls', PlayerControls);

const init = () => {

  const elements = ['pie-player', 'catalog-container'].map(customElements.whenDefined.bind(customElements));

  Promise.all(elements)
    .then(() => {
      const container = document.querySelector('catalog-container');
      container.isLoading(false);

      const { endpoints } = window._pieStore;
      const client = new SessionClient(endpoints);

      customElements.whenDefined('pie-player')
        .then(() => {
          const player = document.querySelector('pie-player');
          window._pieStore.session.answers = window._pieStore.session.answers || [];
          player.session = window._pieStore.session.answers;
          const controller = new PieStoreController(endpoints);
          player.controller = controller;
          player.env = { mode: 'gather' };

          document.addEventListener('player-controls.submit', e => {
            client.submit(player.session)
              .then((env) => player.env = env)
              .catch(e => {
                throw new Error('failed to submit');
              });
          });
        });
    });
}

if (document.readyState === 'ready') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', (e) => {
    init();
  });
}