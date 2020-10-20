
const path			= require('path');

module.exports			= {
    target: "web",

    mode: 'development', // production | development
    devtool: 'source-map',

    entry: [ "babel-polyfill", "./src/index.js" ],

    // Assign 'module.exports' to the variable defined by `output.library`
    output: {
	library: "HHDT",
	libraryTarget: "umd",

	publicPath: "/dist/",
    },

    module: {
	rules: [
	    {
		test: /\.m?js$/,
		exclude: /(node_modules|bower_components)/,
		use: {
		    loader: 'babel-loader',
		    options: {
			presets: ['@babel/preset-env']
		    }
		}
	    }
	],
    },

    plugins: [
    ],
};
