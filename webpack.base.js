var path = require('path');
var webpack = require('webpack');
var ExtractTextWebpackPlugin = require("extract-text-webpack-plugin");
let sassExtract = new ExtractTextWebpackPlugin('sass.css')
let lessExtract = new ExtractTextWebpackPlugin('less.css')

module.exports = {
    output: {
		globalObject: 'self',
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
    },
    resolve: {
        //引入模块的时候，可以不用扩展名
        extensions: [".js", ".less", ".json"],
        modules: [path.resolve(__dirname, 'node_modules')]
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
                include:path.join(__dirname,'./src'),
                exclude:/node_modules/
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.scss$/,
                use: sassExtract.extract({
                    fallback: "style-loader",
                    use: ["css-loader?minimize","sass-loader"],
                    publicPath: "/dist"
                }),
                include:path.join(__dirname,'./src'),
                exclude:/node_modules/
            },
            {
                test: /\.less$/,
                loader: lessExtract.extract({
                    use: ["css-loader?minimize", "less-loader"]
                }),
                include:path.join(__dirname,'./src'),
                exclude:/node_modules/
            },
            {
                test: /\.(html|htm)/,
                use: 'html-withimg-loader'
            },
            {
                test: /\.(png|jpg|gif|svg|bmp|eot|woff|woff2|ttf)/,
                use: {
                    loader:'url-loader',
                    options:{
                        limit: 5 * 1024,
                        //指定拷贝文件的输出目录
                        outputPath: 'images/'
                    }
                }
            }
        ]
    },
    plugins: [
        //定义环境变量
        new webpack.DefinePlugin({
            __development__: JSON.stringify(process.env.NODE_ENV)
        }),
        lessExtract,
        sassExtract,
    ]
};