// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
require('ts-node').register({
  compilerOptions: {
    module: 'nodenext',
  },
  transpileOnly: true
});

// eslint-disable-next-line no-undef
require('./index');
