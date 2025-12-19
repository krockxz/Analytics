import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  // Development build
  {
    input: 'src/tracker.js',
    output: {
      file: 'dist/tracker.js',
      format: 'iife',
      name: 'AnalyticsTracker'
    },
    plugins: [
      nodeResolve()
    ]
  },
  // Production build (minified)
  {
    input: 'src/tracker.js',
    output: {
      file: 'dist/tracker.min.js',
      format: 'iife',
      name: 'AnalyticsTracker'
    },
    plugins: [
      nodeResolve(),
      terser()
    ]
  }
];