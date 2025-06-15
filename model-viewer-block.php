<?php
/**
 * Plugin Name:       3D Model Viewer Block
 * Description:       A WordPress block for viewing 3D models using Google's model-viewer component.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.0
 * Author:            Graham Douglas
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       model-viewer-block
 * Domain Path:       /languages
 *
 * @package ModelViewerBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function model_viewer_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'model_viewer_block_init' );

/**
 * Load plugin textdomain for internationalization.
 */
function model_viewer_block_load_textdomain() {
	load_plugin_textdomain(
		'model-viewer-block',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}
add_action( 'init', 'model_viewer_block_load_textdomain' );

/**
 * Enqueue Google Model Viewer script in frontend
 */
function model_viewer_block_enqueue_scripts() {
	if ( has_block( 'model-viewer-block/model-viewer' ) ) {
		// Add the script tag directly with type="module" since wp_enqueue_script doesn't handle ES modules well
		add_action( 'wp_head', 'model_viewer_block_add_module_script' );
	}
}
add_action( 'wp_enqueue_scripts', 'model_viewer_block_enqueue_scripts' );

/**
 * Add Google Model Viewer script tag with proper module type
 */
function model_viewer_block_add_module_script() {
	echo '<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>' . "\n";
} 