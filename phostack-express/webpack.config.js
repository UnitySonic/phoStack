require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
const path = require('path');
const DotenvPlugin = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  entry: './src/app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'app.js',
  },
  target: 'node',
  plugins: [
    new DotenvPlugin({
      path: '.env.production',
      allowEmptyValues: true,
  }),
  ],
};
