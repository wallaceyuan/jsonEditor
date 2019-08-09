const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    output: {
        filename: 'jsoneditor.min.js',
    },
    plugins: [
        new UglifyJSPlugin(),
        new CleanWebpackPlugin(['dist'])
    ]
}