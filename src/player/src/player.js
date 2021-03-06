require('../../client-common/common');

import CodeEditor from './code-editor';
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

      document.addEventListener('update-session', e => {
        client.updateSession(e.detail.session)
          .then(s => {
            env.mode = s.isComplete ? (env.mode === 'evaluate' ? 'evaluate' : 'view') : 'gather';
            player.env = env;
            updateSession(s);
          })
          .catch(e => console.log(e));
      });

      document.addEventListener('player-controls.switch-mode', e => {
        const { mode } = e.detail;
        env.mode = mode;
        player.env = env;
      });

      document.addEventListener('player-controls.submit', e => {
        client.submit(_pieStore.session.answers)
          .then(({ env, session }) => {
            player.env = env;
            sessionEditor.session = session;
          })
          .catch(e => {
            console.log(e);
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