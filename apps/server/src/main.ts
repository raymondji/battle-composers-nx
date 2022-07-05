/**
 * This is not a production server yet!
 * This is only a minimal server to get started.
 */

import * as express from 'express';
import { setupWebsocket } from './app/websocket';

const app = express();

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/multiplayer`);
});
setupWebsocket(server);

server.on('error', console.error);
