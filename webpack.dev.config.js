var HtmlWebpackPlugin = require("html-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin')
var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry:{
      'index':'./demo/index.js',
  },
  devServer: {
      contentBase: path.resolve(__dirname,'dist'),
      publicPath: '/',
      port: 8080,
      hot:true,
      compress:true,
      historyApiFallback: true,
      inline: true
  },
  watch: false, //只有在开启监听模式时，watchOptions才有意义
  watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300, //监听到变化发生后等300ms再去执行动作，防止文件更新太快导致编译频率太高
      poll: 1000 //通过不停的询问文件是否改变来判断文件是否发生变化，默认每秒询问1000次
  },
  module: {
    rules:[
      {
          test: /\.jsx?$/,
          use: {
              loader:'babel-loader',
              options: {
                  presets: ['react','es2015','stage-0'],
              }
          },
          include: path.join(__dirname,'./demo'),
          exclude: /node_modules/
      }
    ]
  },
  plugins:[
    new HtmlWebpackPlugin({
      title: '',
      template: './demo/index.html',
      filename: `index.html`,
      hash: true
    }),
    new webpack.DllReferencePlugin({
        manifest: path.join(__dirname, 'vendor', 'react.manifest.json')
    }),
    new CopyWebpackPlugin([{
        from: path.join(__dirname,'vendor'),//静态资源目录源地址
        to:'./vendor' //目标地址，相对于output的path目录
    }]),
    new webpack.HotModuleReplacementPlugin(), // 热替换插件
    new webpack.NamedModulesPlugin(), // 执行热替换时打印模块名字
  ]
}