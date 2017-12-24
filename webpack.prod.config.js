try {
  var path = require('path');
  var os = require('os');

  var webpack = require('webpack');
  var HtmlWebpackPlugin = require('html-webpack-plugin');
  var ExtractTextPlugin = require('extract-text-webpack-plugin');
  var ProgressBarPlugin = require('progress-bar-webpack-plugin');
  var CopyWebpackPlugin = require('copy-webpack-plugin');

  var autoprefixer = require('autoprefixer');
  var precss = require('precss');

} catch (e) {
  throw new Error('Missing Webpack Build Dependencies.');
}

var useCache = !!process.env.WP_CACHE;

module.exports = {
  context: __dirname,
  cache: useCache,
  stats: {
    warnings: false,
    children: false
  },

  entry: {
    'polyfills': './src/polyfills',
    'vendor': './src/vendor',
    'app': './src/main'
  },

  output: {
    path: path.join(__dirname, 'www'),
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    root: [
      path.join(__dirname, 'src'),
      path.join(__dirname, 'node_modules')
    ],

    extensions: ['', '.ts', '.js', '.json', '.css', '.html', '.styl'],

    unsafeCache: useCache
  },

  module: {
    loaders: [{
      test: /\.ts$/,
      loader: 'ts-loader',
      include: path.join(__dirname, 'src'),

      query: {
        presets: [
          'babel-preset-es2015',
          'babel-preset-stage-2'
        ],

        cacheDirectory: useCache
      }
    }, {
      test: /\.html$/,
      loader: 'html'
    }, {
      test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
      loader: 'file?name=assets/[name].[hash].[ext]'
    }, {
      test: /\.styl$/,
      loader: 'style!css!postcss!stylus',
    }, {
      test: /\.css$/,
      exclude: path.join(__dirname, 'src', 'app'),
      loader: ExtractTextPlugin.extract('style', 'css?sourceMap')
    }, {
      test: /\.css$/,
      include: path.join(__dirname, 'src', 'app'),
      loader: 'raw!postcss'
    }, {
      test: /\.json$/,
      loader: 'json'
    }],

    noParse: [/.+zone\.js\/dist\/.+/, /.+angular2\/bundles\/.+/, /angular2-polyfills\.js/]
  },

  htmlLoader: {
    minimize: true,
    removeAttributeQuotes: false,
    caseSensitive: true,
    customAttrSurround: [[/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/]],
    customAttrAssign: [/\)?\]?=/]
  },

  postcss: function() {
    return [precss, autoprefixer];
  },

  ts: {
    compilerOptions: {
      sourceMap: false,
      sourceRoot: './src',
      inlineSourceMap: true
    }
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),
    new HtmlWebpackPlugin({
      template: 'src/public/index.html.ejs',
      chunksSortMode: 'dependency',
      externalCSS: ['components/loader.css'],
      externalJS: ['components/loader.js'],
      minify: {
        caseSensitive: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeAttributeQuotes: false,
        removeComments: true
      }
    }),
    //new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: false,
        compress: {
            warnings: false,
            screw_ie8: true
        },
        comments: false
    }),
    //new CopyWebpackPlugin([{
    //  from: path.join(__dirname, 'src', 'public'),
    //  ignore: ['index.html.ejs']
    //}]),
    new ProgressBarPlugin()
  ],

};

