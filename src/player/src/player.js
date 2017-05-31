require('../../client-common/common');

import HPane from './h-pane';
import PiePlayer from 'pie-player';
import PieStoreController from './pie-store-controller';
import SessionClient from './session-client';
import SessionOutcome from './session-outcome';
import SimplePlayerControls from './simple-player-controls';
import some from 'lodash/some';

customElements.define('pie-player', PiePlayer);
customElements.define('simple-player-controls', SimplePlayerControls);
customElements.define('session-outcome', SessionOutcome);
customElements.define('h-pane', HPane);

//TODO: Use a binding lib built w/ es6 proxies?

const store = () => {
  return window._pieStore;
};

const init = () => {

  const elements = [
    'pie-player',
    'catalog-container'].map(n => customElements.whenDefined(n));

  Promise.all(elements)
    .then(() => {
      const container = document.querySelector('catalog-container');
      container.isLoading(false);

      const { env, session, endpoints } = store();
      const player = document.querySelector('pie-player');
      const client = new SessionClient(endpoints);
      const controls = document.querySelector('simple-player-controls');
      const sessionOutcome = document.querySelector('session-outcome');
      const controller = new PieStoreController(endpoints);

      const allComplete = (statuses) => !some(statuses, s => !s.complete);

      const updateSession = (s) => {
        _pieStore.session = s;
        session.answers = s.answers || [];
        player.sessions(s.answers);
      };

      updateSession(_pieStore.session);

      player.controller = controller;
      player.env(env);

      const updateCanSubmit = () => {
        player.status()
          .then(s => {
            const ac = allComplete(s);
            controls.canSubmit = ac && !store().session.isComplete;
            console.log('[updateCanSubmit] status: ', s);
          });
      }

      const updateOutcomeUi = () => {
        const isViewMode = store().env.mode === 'view';
        const isComplete = store().session.isComplete;
        controls.canGetOutcome = isViewMode && isComplete;
      }

      const saveSession = () => {
        client.updateSession(_pieStore.session, false)
          .catch(e => {
            console.error('Error saving the session: ', e.message);
          });
      }

      player.addEventListener('model-updated', e => {
        console.log('model updated successfully', e);
      });


      player.addEventListener('sessions-changed', e => {
        console.log('received sessions-changed', e.detail.statuses);
        updateCanSubmit();
        updateOutcomeUi();
        saveSession();
      });

      document.addEventListener('player-controls.submit', e => {
        client.submit(_pieStore.session.answers)
          .then(({ env, session }) => {
            player.env(env);
            store().env = env;
            store().session = session;
            updateCanSubmit();
            updateOutcomeUi();
          })
      });

      document.addEventListener('player-controls.get-outcome', e => {
        console.log('get outcome..');
        const { session, env } = store();
        player.outcomes(session, env)
          .then((outcomes) => {
            console.log('outcomes: ', outcomes);
            sessionOutcome.outcome = outcomes;
            env.mode = 'evaluate';
            player.env(env);
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