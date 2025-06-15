const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	// Add any custom webpack configuration here if needed
	resolve: {
		...defaultConfig.resolve,
		// Ensure model-viewer can be resolved
		fallback: {
			...defaultConfig.resolve.fallback,
		},
	},
}; 