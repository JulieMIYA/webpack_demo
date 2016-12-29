const webpack = require('webpack');
const path = require('path');

//remove old hashed files from the last build
const CleanWebpackPlugin = require('clean-webpack-plugin');

//separate css file from js files in production mode
const ExtractTextPlugin = require('extract-text-webpack-plugin');

//strip unused css from giant css framework
const PurifyCSSPlugin = require('purifycss-webpack-plugin');


exports.devServer = function(options) {
    return {
        devServer: {
            contentBase : options.path,
            port : options.port,
            watchOptions: {
                // Delay the rebuild after the first change
                aggregateTimeout: 300,
                // Poll using interval (in ms, accepts boolean too)
                poll: 1000
            }
        },
        plugins: [
            // ignore node_modules so CPU usage with poll watching drops significantly
            new webpack.WatchIgnorePlugin([
                path.join(__dirname, 'node_modules')
            ]),
            new webpack.HotModuleReplacementPlugin({
                // Disabled as this won't work with html-webpack-template yet
                //multiStep: true
            })
        ]
};
}

exports.setupCSS = function(paths) {
    return {
        module: {
            rules: [
                {
                    test: /\.sass$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                    include: paths
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                    include: paths
                }
            ]
        }
    };
}

exports.minify = function() {
    return {
        plugins: [
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ]
    };
}

exports.setFreeVariable = function(key, value) {
    const env = {};
    env[key] = JSON.stringify(value);

    return {
        plugins: [
            new webpack.DefinePlugin(env)
        ]
    };
}

exports.extractBundle = function(options) {
    const entry = {};
    entry[options.name] = options.entries;
    return {
        // Define an entry point needed for splitting.
        entry: entry,
        plugins: [
            // Extract bundle and manifest files. Manifest is
            // needed for reliable caching.
            new webpack.optimize.CommonsChunkPlugin({
                names: [options.name, 'manifest']
            })
        ]
    };
}

exports.clean = function(path) {
    return {
        plugins: [
            new CleanWebpackPlugin([path], {
                // Without `root` CleanWebpackPlugin won't point to our
                // project and will fail to work.
                root: process.cwd()
            })
        ]
    };
}

//should not use ExtractTextPlugin for development configuration.
exports.extractCSS = function(paths) {
    return {
        module: {
            rules: [
                // Extract CSS during build
                {
                    test: /\.sass$/,
                    loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: 'css-loader!sass-loader'
                    }),
                    include: paths
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract({
                        fallbackLoader: 'style-loader',
                        loader: 'css-loader'
                    }),
                    include: paths
                }
            ]
        },
        plugins: [
            // Output extracted CSS to a file
            new ExtractTextPlugin('[name].[chunkhash].css')
        ]
    };
}

exports.purifyCSS = function(paths) {
    return {
        plugins:[
            new PurifyCSSPlugin(
                {
                    basePath: process.cwd(),
                    // `paths` is used to point PurifyCSS to files not
                    // visible to Webpack. This expects glob patterns so
                    // we adapt here.
                    paths: paths.map( path => `${path}/*`),
                    resolveExtensions: ['.html']
                }
            )
        ]
    }
}