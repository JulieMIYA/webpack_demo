const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

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