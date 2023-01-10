const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  // Add any Storybook addons you want here: https://storybook.js.org/addons/
  addons: [
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    config.module.rules.push({
      test: /\.mjs$/,
      include: [/node_modules\/react-virtuoso/],
      use: [
        {
          loader: 'babel-loader',
          options: { presets: [['@babel/preset-env', { modules: 'commonjs' }]] },
        },
      ],
    });

    config.resolve.modules = [path.resolve(__dirname, '..', 'src'), 'node_modules'];

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: [['react-app', { flow: false, typescript: true }]],
      },
    });

    config.resolve.extensions.push('.ts', '.tsx');

    return config;
  },
};
