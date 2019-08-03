import * as env from 'env-var';
// import { initMedia } from '../media';
// import OPCManager from '../OPCManager';
// import RaspiManager from '../RaspiManager';
// import server from '../server';
// import masterVisibilityManager from '../masterVisibilityManager';
// import nodeStatusManager from '../nodeStatusManager';

export default async function() {
  // Hack around my silly arch, prevents listeners and runners getting
  // initialized outside the server context.
  const { initMedia } = require('../media');
  const OPCManager: typeof import('../OPCManager').default = require('../OPCManager').default;
  const RaspiManager: typeof import('../RaspiManager').default = require('../RaspiManager').default;
  const server: typeof import('../server').default = require('../server').default;
  const masterVisibilityManager: typeof import('../masterVisibilityManager').default = require('../masterVisibilityManager').default;

  const nodeStatusManager: typeof import('../nodeStatusManager').default = require('../nodeStatusManager').default;

  await initMedia();

  masterVisibilityManager.start();
  const opcManager = OPCManager.getInstance();
  const raspiManager = new RaspiManager(nodeStatusManager, OPCManager.getInstance(), masterVisibilityManager);
  raspiManager.start();

  const app = server({
    opcManager,
  });

  const port = env.get('PORT', '44668').asPortNumber();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}.`);
  });

  // Wait forever
  await new Promise(() => {});
}
