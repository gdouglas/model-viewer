module.exports = {
	extends: [ '@wordpress/eslint-config/recommended' ],
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	globals: {
		wp: 'readonly',
	},
	rules: {
		// Add any custom rules here
		'no-console': 'warn',
	},
}; 