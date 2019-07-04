import server from './server';
import OPCManager from './OPCManager';
import { initMedia, getFrameplayers } from './media';
import * as env from 'env-var';

(async () => {
  await initMedia();

  const opcManager = new OPCManager(getFrameplayers());

  const app = server({
    opcManager,
  });

  const port = env.get('PORT', '44668').asPortNumber();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}.`);
  });
})();
