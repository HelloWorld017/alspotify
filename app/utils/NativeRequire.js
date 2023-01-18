// file: native-require.js
// webpack replaces calls to `require()` from within a bundle. This module
// is not parsed by webpack and exports the real `require`
// NOTE: since the module is unparsed, do not use es6 exports
// eslint-disable-next-line no-undef,@typescript-eslint/no-unsafe-assignment
module.exports = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
