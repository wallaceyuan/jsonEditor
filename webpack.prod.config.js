var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry:{
        'index':'./src/main.js',
    },
    output: {
        filename: 'JsonEditor.js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist'])
    ]
}