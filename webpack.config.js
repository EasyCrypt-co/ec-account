var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: [
        './src/js/index.js']
    ,
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015'],
                exclude: /node_modules/
            },
            {
                test: /\.scss/,
                loader: 'style-loader!css-loader!sass-loader'
            },
            {
                test: /\.png$/,
                loader: "url-loader?mimetype=image/png"
            }
        ]
    },
    output: {
        path: './bin',
        filename: 'js/bundle.min.js'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};
