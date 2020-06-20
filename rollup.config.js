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
  },
  // Node.js + ESModule
  {
    input: './src/main.ts',
    output: {
      file: './dist/esm/main.js',
      format: 'esm',
    },
    plugins: [typescript()],
  },
  // Browser + UMD
  {
    input: './src/browser.ts',
    output: {
      file: './dist/lib/browser.js',
      format: 'umd',
      name: 'puppeteer-rpc',
    },
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      typescript(),
    ],
  },
  // Browser + ESModule
  {
    input: './src/browser.ts',
    output: {
      file: './dist/esm/browser.js',
      format: 'esm',
    },
    plugins: [
      typescript(),
    ],
  },
];
