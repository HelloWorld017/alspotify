import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';
import copy from 'rollup-plugin-copy'
import nativePlugin from 'rollup-plugin-natives';

import typescript from 'rollup-plugin-typescript2';

import path from 'path';

const nodeEnv = (process.env.NODE_ENV || 'development').trim();

export default defineConfig({
  input: {
    alspotify: path.resolve(__dirname, 'app', 'index.ts'),
  },
  output: {
    dir: path.resolve(__dirname, 'dist'),
    entryFileNames: (chunkInfo) => `${chunkInfo.name}.bundle.js`,
    format: 'cjs',
  },
  plugins: [
    alias({
      entries: [
        { find: /^@\//, replacement: './' },
      ]
    }),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    nativePlugin({
      copyTo: 'dist',
    }),
    nodeResolve(),
    commonjs(),
    json(),
    image(),
    copy({
      targets: [
        {
          src: 'app/assets/*',
          dest: './dist/assets'
        },
      ]
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    }),
    terser(),
  ],
});
