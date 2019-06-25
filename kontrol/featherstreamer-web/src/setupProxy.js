// @ts-check
const proxy = require('http-proxy-middleware');
const { BACKEND_PREFIX } = require('./routing');

const BACKEND_PORT = 44668;

/**
 * @param { import('express').Application } app - The express app.
 */
module.exports = function(app) {
  app.use(proxy(BACKEND_PREFIX, {
    target: `http://localhost:${BACKEND_PORT}/`,
    pathRewrite: (path) => path.replace(new RegExp(`^${BACKEND_PREFIX}`), ''),
  }));
}
