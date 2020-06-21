import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default [
  // Node.js + CommonJS
  {
    input: './src/main.ts',
    output: {
      file: './dist/lib/main.js',
      format: 'cjs',
    },
    plugins: [commonjs(), typescript()],
    external: ['eventemitter3'],
  },
  // Node.js + ESModule
  {
    input: './src/main.ts',
    output: {
      file: './dist/esm/main.js',
      format: 'esm',
    },
    plugins: [typescript()],
    external: ['eventemitter3'],
  },
  // Browser + UMD
  {
    input: './src/browser.ts',
    output: {
      file: './dist/lib/browser.js',
      format: 'umd',
      name: 'ipc',
    },
    plugins: [resolve({ preferBuiltins: true }), commonjs(), typescript()],
  },
];
