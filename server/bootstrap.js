process.env.NODE_ENV = 'production';

global.fetch = require("node-fetch");

require('@babel/polyfill');
require('@babel/register')({
    ignore: [ /\/(build|node_modules)/ ],
    presets: ['@babel/preset-env', 'react-app'],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
    extensions: ['.js', '.jsx', '.ts', '.tsx']
});
require('ignore-styles');

require('./index');
