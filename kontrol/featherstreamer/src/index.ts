import * as dgram from 'dgram';
import * as os from 'os';

const port = 44668;
const multicastAddr = '224.0.0.7';

const socket = dgram.createSocket({
  type: 'udp4',
  reuseAddr: true
});
socket.bind(port);
socket.on('listening', () => {
  socket.addMembership(multicastAddr);

  let numSent: number = 0;

  setInterval(() => {
    numSent++;
    const message = `Hello from ${os.hostname} (${numSent})`;
    socket.send(message, 0, message.length, port, multicastAddr, () => {
      console.log(`SENDING: ${message}`);
    });
  }, 5000);


  const address = socket.address();
  const addressStr: string = (typeof address === 'string') ? address : `${address.address}:${address.port}`;
  console.log(`UDP socket listening on ${addressStr}.`);
});

socket.on('message', (message, rinfo) => {
  console.log(`Message from ${rinfo.address}:${rinfo.port}: ${message}`);
});

