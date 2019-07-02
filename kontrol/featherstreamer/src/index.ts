import server from './server';
import OPCManager from './OPCManager';
import { initMedia } from './media';

(async () => {
  await initMedia();

  const opcManager = new OPCManager();

  const app = server({
    opcManager,
  });

  const port = 44668;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}.`);
  });
})();
