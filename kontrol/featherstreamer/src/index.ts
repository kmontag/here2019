import * as env from 'env-var';
import { initMedia } from './media';
import OPCManager from './OPCManager';
import server from './server';

(async () => {
  await initMedia();

  const opcManager = OPCManager.getInstance();

  const app = server({
    opcManager,
  });

  const port = env.get('PORT', '44668').asPortNumber();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}.`);
  });
})();
