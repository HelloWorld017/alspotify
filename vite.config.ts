import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

const nodeEnv = (process.env.NODE_ENV || 'development').trim();

export default defineConfig({
  mode: nodeEnv,
  build: {
    lib: {
      entry: {
        alspotify: path.resolve(__dirname, 'app', 'index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@nodegui/nodegui', '@nodegui/react-nodegui', '@nodegui/qode'],
      output: {
        dir: path.resolve(__dirname, 'dist'),
        entryFileNames: (chunkInfo) => `${chunkInfo.name}.bundle.js`,
      },
    },
    minify: nodeEnv === 'development' ? 'esbuild' : 'terser',
    target: 'ESNext',
  },
  resolve: {
    alias: [
      {
        find: /^bindings$/,
        replacement: `${__dirname}/app/utils/Bindings`,
      },
    ],
    extensions: ['.ts', '.json', '.js', '.wasm'],
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'app/assets/*',
          dest: './assets'
        },
        {
          src: 'node_modules/@nodegui/nodegui/build/Release/nodegui_core.node',
          dest: './'
        }
      ]
    })
  ]
});
