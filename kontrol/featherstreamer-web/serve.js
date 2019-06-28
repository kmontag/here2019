// Serve the built site. We can't just use the basic "serve" package
// since we need to set up the proxy handler as well.
const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');
const setupProxy = require('./src/setupProxy');

const app = express();
const port = 80;

app.use(serveStatic(path.join(__dirname, 'build')));
setupProxy(app);
app.listen(port);