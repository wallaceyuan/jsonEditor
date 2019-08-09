const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry:{
        'index':'./src/main.js',
    },
    output: {
        filename: 'jsoneditor.min.js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ]
}