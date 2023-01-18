// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
  },
  transpileOnly: true
});

// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const Module = require('module');

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
Module._extensions['.png'] = (module, filename) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  module.exports = filename;
}

// eslint-disable-next-line no-undef
require('./index');
