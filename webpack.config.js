const path = require('path');
const merge = require('webpack-merge');
const parts = require('./webpack.parts');
const HtmlWebpackPlugin = require('html-webpack-plugin');


const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build'),
    style: [
        path.join(__dirname, 'node_modules', 'purecss'),
        path.join(__dirname, 'app', 'main.sass')
    ]
};
const common = merge(
    {
        entry: {
            app: PATHS.app,
            style: PATHS.style
        },
        plugins: [
            new HtmlWebpackPlugin({ title: 'Webpack demo Application'})
        ]
    },
    parts.extractBundle({
        name: 'vendor',
        entries: ['react']
    })
);

/*
module.exports = {
    // Entry accepts a path or an object of entries.
    // We'll be using the latter form given it's
    // convenient with more complex configurations.
    //
    // Entries have to resolve to files! It relies on Node.js
    // convention by default so if a directory contains *index.js*,
    // it will resolve to that.
    entry: {
        app: PATHS.app
    },
    output: {
        path: PATHS.build,
        filename: '[name].js'
    },
    devServer : {
        contentBase : PATHS.build,
        inline: true,
        stats: 'errors-only'
    }
};*/

module.exports = function(env) {
    if (env === 'build') {
        return merge(
            common,
            {
                devtool: 'source-map',
                output: {
                    path: PATHS.build,
                    filename: '[name].[chunkhash].js',
                    // This is used for code splitting. The setup
                    // will work without but this is useful to set.
                    chunkFilename: '[chunkhash].js',
                    publicPath: '/webpack-demo/'
                }
            },
            parts.clean(PATHS.build),
            parts.setFreeVariable(
                'process.env.NODE_ENV',
                'production'
            ),
            parts.minify(),
            parts.extractCSS(PATHS.style),
            parts.purifyCSS([PATHS.app])
        );
    }
    return merge(
        common,
        {
            devtool: 'eval-source-map',
            // Disable performance hints during development
            performance: {
                hints: false
            },
            output: {
                path: PATHS.build,
                filename: '[name].js'
            }
        },
        parts.setupCSS(PATHS.style),
        parts.devServer({
            path: PATHS.build,
            port: 8080
        })
    );
};
