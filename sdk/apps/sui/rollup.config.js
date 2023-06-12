import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [typescript(), nodeResolve(), commonjs(), terser()],
    external: [
      '@mysten/sui.js',
      '@mysten/wallet-standard',
      '@noble/hashes',
      '@nightlylabs/nightly-connect-base',
      'isomorphic-localstorage',
      'isomorphic-ws',
      'tiny-typed-emitter',
      'uuid'
    ]
  },
  {
    input: 'dist/esm/types/apps/sui/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()]
  }
]