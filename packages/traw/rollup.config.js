import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import json from '@rollup/plugin-json';

const packageJson = require('./package.json');

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      exclude: ['node_modules', 'build', 'storybook-static', 'src/**/*.stories.tsx', 'src/**/*.test.tsx'],
    }),
    json(),
    postcss(),
    copy({
      targets: [
        {
          src: 'src/index.css',
          dest: 'build',
          rename: 'index.css',
        },
      ],
    }),
  ],
  external: ['react', 'react-dom'],
  onwarn(warning, warn) {
    // Skip for react-lottie
    if (warning.code === 'EVAL') return;

    // Use default for everything else
    warn(warning);
  },
};
