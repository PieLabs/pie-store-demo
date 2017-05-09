require('../../client-common/common');

import CodeEditor from './code-editor';
import ErrorLog from './error-log';
import HPane from './h-pane';
import PiePlayer from 'pie-player';
import PieStoreController from './pie-store-controller';
import PlayerControls from './player-controls';
import SessionClient from './session-client';
import SessionEditor from './session-editor';

customElements.define('pie-player', PiePlayer);
customElements.define('player-controls', PlayerControls);
customElements.define('h-pane', HPane);
customElements.define('code-editor', CodeEditor);
customElements.define('session-editor', SessionEditor);
customElements.define('error-log', ErrorLog);

const store = () => {
  return window._pieStore;
};

const init = () => {

  const elements = [
    'pie-player',
    'catalog-container',
    'code-editor',
    'session-editor'].map(customElements.whenDefined.bind(customElements));

  Promise.all(elements)
    .then(() => {
      const container = document.querySelector('catalog-container');
      container.isLoading(false);

      const { env, session, endpoints } = store();
      const sessionEditor = document.querySelector('session-editor');
      const player = document.querySelector('pie-player');
      const log = document.querySelector('error-log');
      const client = new SessionClient(endpoints);
      const controller = new PieStoreController(endpoints);

      const updateSession = (s) => {
        _pieStore.session = s;
        sessionEditor.session = s;
        session.answers = s.answers || [];
        player.session = s.answers;
      };

      updateSession(_pieStore.session);

      player.controller = controller;
      player.env = env;

      player.addEventListener('response-changed', e => {
        console.log('response-changed', e.target);
        sessionEditor.session = store().session;
        player.status()
          .then(s => {
            log.info('[response-changed] status: ', s);
          })
      });

      player.addEventListener('model-set', e => {
        console.log('model-set', e.target);
        player.status()
          .then(s => {
            log.info('[model-set] status: ', s);
          });
      });

      player.addEventListener('pie.model-updated', e => {
        console.log('model updated successfully', e);
      });

      player.addEventListener('pie.model-update.error', e => {
        console.log('model update failed', e);
        log.error(e.detail.error);
      });

      player.addEventListener('status-changed', e => {
        log.info('received status-changed', e.detail.statuses);
      })

      //from the session editor
      document.addEventListener('update-session', e => {
        client.updateSession(e.detail.session)
          .then(s => {
            env.mode = s.isComplete ? (env.mode === 'evaluate' ? 'evaluate' : 'view') : 'gather';
            player.env = env;
            updateSession(s);
          })
          .catch(e => console.log(e));
      });

      //from the player control bar
      document.addEventListener('player-controls.switch-mode', e => {
        const { mode } = e.detail;
        env.mode = mode;
        player.env = env;
      });

      document.addEventListener('player-controls.get-outcome', e => {
        const { env, session } = store();

        player.getOutcome(session, env)
          .then(o => {
            console.log('outcome: ', o);
            log.info('outcome', o);
          })
          .catch(log.error);
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
            player.env = env;
            sessionEditor.session = session;
          })
          .catch(e => log.error(e));
      });

      document.addEventListener('player-controls.reset-response', e => {
        player.resetResponse()
          .then(() => client.updateSession(store().session, true))
          .then(() => {
            player.session = store().session.answers;
            sessionEditor.session = store().session;
            log.info('reset-response complete.');
          })
          .catch(e => log.error(e));
      });

      document.addEventListener('player-controls.reset', e => {
        player.reset()
          .then(() => client.updateSession(store().session, true))
          .then(() => {
            player.session = store().session.answers;
            sessionEditor.session = store().session;
            log.info('reset complete.');
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