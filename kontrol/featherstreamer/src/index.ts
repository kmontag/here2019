import server from './server';
import OPCManager from './OPCManager';

const opcManager = new OPCManager();
opcManager.start();

const app = server({
  opcManager,
});

const port = 44668;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}.`);
});
