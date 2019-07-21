import * as env from 'env-var';
import { initMedia } from './media';
import OPCManager from './OPCManager';
import RaspiManager from './RaspiManager';
import server from './server';
import masterVisibilityManager from './masterVisibilityManager';

(async () => {
  await initMedia();

  masterVisibilityManager.start();
  const opcManager: OPCManager = OPCManager.getInstance();
  const raspiManager: RaspiManager = new RaspiManager();
  raspiManager.start();

  const app = server({
    opcManager,
  });

  const port = env.get('PORT', '44668').asPortNumber();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}.`);
  });
})();
