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
 * Plugin activation hook
 */
function model_viewer_block_activate() {
	// Add GLB file support to WordPress
	model_viewer_block_add_glb_support();
}
register_activation_hook( __FILE__, 'model_viewer_block_activate' );

/**
 * Plugin deactivation hook
 */
function model_viewer_block_deactivate() {
	// Remove GLB file support from WordPress
	model_viewer_block_remove_glb_support();
}
register_deactivation_hook( __FILE__, 'model_viewer_block_deactivate' );

/**
 * Add GLB and GLTF file support to WordPress uploads
 */
function model_viewer_block_add_glb_support() {
	// Get current allowed file types
	$allowed_types = get_option( 'upload_filetypes', '' );
	
	// Add GLB if not already present
	if ( strpos( $allowed_types, 'glb' ) === false ) {
		$allowed_types = trim( $allowed_types );
		if ( ! empty( $allowed_types ) ) {
			$allowed_types .= ' glb';
		} else {
			$allowed_types = 'glb';
		}
	}
	
	// Add GLTF if not already present
	if ( strpos( $allowed_types, 'gltf' ) === false ) {
		$allowed_types = trim( $allowed_types );
		if ( ! empty( $allowed_types ) ) {
			$allowed_types .= ' gltf';
		} else {
			$allowed_types = 'gltf';
		}
	}
	
	update_option( 'upload_filetypes', $allowed_types );
	
	// Add filter to allow 3D model files in media uploads
	add_filter( 'upload_mimes', 'model_viewer_block_allow_glb_upload' );
	add_filter( 'wp_check_filetype_and_ext', 'model_viewer_block_check_glb_filetype', 10, 5 );
}

/**
 * Remove GLB and GLTF file support from WordPress uploads
 */
function model_viewer_block_remove_glb_support() {
	// Get current allowed file types
	$allowed_types = get_option( 'upload_filetypes', '' );
	
	// Remove GLB if present
	if ( strpos( $allowed_types, 'glb' ) !== false ) {
		$allowed_types = str_replace( array( ' glb', 'glb ' ), '', $allowed_types );
		$allowed_types = str_replace( 'glb', '', $allowed_types );
	}
	
	// Remove GLTF if present
	if ( strpos( $allowed_types, 'gltf' ) !== false ) {
		$allowed_types = str_replace( array( ' gltf', 'gltf ' ), '', $allowed_types );
		$allowed_types = str_replace( 'gltf', '', $allowed_types );
	}
	
	$allowed_types = trim( $allowed_types );
	update_option( 'upload_filetypes', $allowed_types );
	
	// Remove filters
	remove_filter( 'upload_mimes', 'model_viewer_block_allow_glb_upload' );
	remove_filter( 'wp_check_filetype_and_ext', 'model_viewer_block_check_glb_filetype' );
}

/**
 * Allow 3D model files to be uploaded
 */
function model_viewer_block_allow_glb_upload( $mimes ) {
	$mimes['glb'] = 'model/gltf-binary';
	$mimes['gltf'] = 'model/gltf+json';
	return $mimes;
}

/**
 * Fix 3D model file type detection
 */
function model_viewer_block_check_glb_filetype( $data, $file, $filename, $mimes, $real_mime ) {
	if ( ! empty( $data['ext'] ) && ! empty( $data['type'] ) ) {
		return $data;
	}

	$wp_file_type = wp_check_filetype( $filename, $mimes );

	// Check for GLB files
	if ( 'glb' === $wp_file_type['ext'] ) {
		$data['ext'] = 'glb';
		$data['type'] = 'model/gltf-binary';
	}

	// Check for GLTF files
	if ( 'gltf' === $wp_file_type['ext'] ) {
		$data['ext'] = 'gltf';
		$data['type'] = 'model/gltf+json';
	}

	return $data;
}

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
 * Enable GLB file uploads when plugin is active
 */
function model_viewer_block_enable_glb_uploads() {
	add_filter( 'upload_mimes', 'model_viewer_block_allow_glb_upload' );
	add_filter( 'wp_check_filetype_and_ext', 'model_viewer_block_check_glb_filetype', 10, 5 );
}
add_action( 'init', 'model_viewer_block_enable_glb_uploads' );

/**
 * Enqueue scripts for the model viewer block
 */
function model_viewer_block_enqueue_scripts() {
	if ( has_block( 'model-viewer-block/model-viewer' ) ) {
		// Enqueue Google Model Viewer as a module
		wp_enqueue_script(
			'google-model-viewer',
			'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js',
			array(),
			'3.4.0',
			array(
				'strategy' => 'defer',
				'in_footer' => true
			)
		);
		
		// Add module type attribute
		add_filter( 'script_loader_tag', 'model_viewer_block_add_module_type', 10, 3 );
		
		// Enqueue our frontend JavaScript
		wp_enqueue_script(
			'model-viewer-block-frontend',
			plugin_dir_url( __FILE__ ) . 'src/frontend.js',
			array(),
			'1.0.0',
			array(
				'strategy' => 'defer',
				'in_footer' => true
			)
		);
		
		// Add module type to our frontend script too
		add_filter( 'script_loader_tag', 'model_viewer_block_add_module_type', 10, 3 );
	}
}
add_action( 'wp_enqueue_scripts', 'model_viewer_block_enqueue_scripts' );

/**
 * Add type="module" to specific scripts
 */
function model_viewer_block_add_module_type( $tag, $handle, $src ) {
	if ( in_array( $handle, array( 'google-model-viewer', 'model-viewer-block-frontend' ), true ) ) {
		$tag = str_replace( '<script ', '<script type="module" ', $tag );
	}
	return $tag;
} 