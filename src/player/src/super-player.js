require('../../client-common/common');

import CodeEditor from './code-editor';
import ErrorLog from './error-log';
import HPane from './h-pane';
import PiePlayer from 'pie-player';
import PieStoreController from './pie-store-controller';
import PlayerControls from './player-controls';
import SessionClient from './session-client';
import SessionEditor from './session-editor';
import some from 'lodash/some';

customElements.define('pie-player', PiePlayer);
customElements.define('player-controls', PlayerControls);
customElements.define('h-pane', HPane);
customElements.define('code-editor', CodeEditor);
customElements.define('session-editor', SessionEditor);
customElements.define('error-log', ErrorLog);

//TODO: Use a binding lib built w/ es6 proxies?

const store = () => {
  return window._pieStore;
};

const init = () => {

  const elements = [
    'pie-player',
    'catalog-container',
    'code-editor',
    'session-editor'].map(n => customElements.whenDefined(n));

  Promise.all(elements)
    .then(() => {
      const container = document.querySelector('catalog-container');
      container.isLoading(false);

      const { env, session, endpoints } = store();
      const sessionEditor = document.querySelector('session-editor');
      const player = document.querySelector('pie-player');
      const log = document.querySelector('error-log');
      const client = new SessionClient(endpoints);
      const controls = document.querySelector('player-controls');
      const controller = new PieStoreController(endpoints);

      const allComplete = (statuses) => !some(statuses, s => !s.complete);

      const updateSession = (s) => {
        _pieStore.session = s;
        sessionEditor.session = s;
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
            log.info('[updateCanSubmit] status: ', s);
          });
      }

      player.addEventListener('model-updated', e => {
        console.log('model updated successfully', e);
      });


      player.addEventListener('sessions-changed', e => {
        log.info('received sessions-changed', e.detail.statuses);
        sessionEditor.session = store().session;
        updateCanSubmit();
      });

      //from the session editor
      document.addEventListener('update-session', e => {
        client.updateSession(e.detail.session)
          .then(s => {
            env.mode = s.isComplete ? (env.mode === 'evaluate' ? 'evaluate' : 'view') : 'gather';
            player.env(env)
              .then(() => {
                updateSession(s);
                updateCanSubmit();
              })
              .catch(e => log.error(e));
          })
          .catch(e => log.error(e));
      });

      //from the player control bar
      document.addEventListener('player-controls.switch-mode', e => {
        const { mode } = e.detail;
        env.mode = mode;
        player.env(env)
          .catch(e => log.error(e));
      });

      document.addEventListener('player-controls.get-outcome', e => {
        const { env, session } = store();

        player.outcomes(session, env)
          .then(o => {
            log.info('outcome', o);
          })
          .catch(e => log.error(e));
      });

      document.addEventListener('player-controls.get-status', e => {
        const { env, session } = store();

        player.status()
          .then(o => {
            console.log('status: ', o);
            log.info('status', o);
          })
          .catch(e => log.error(e));
      });

      document.addEventListener('player-controls.submit', e => {
        client.submit(_pieStore.session.answers)
          .then(({ env, session }) => {
            player.env(env);
            store().session = session;
            sessionEditor.session = session;
            updateCanSubmit();
          })
          .catch(e => log.error(e));
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