/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {Element} Element to render.
 */
/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

export default function save( { attributes } ) {
	const {
		src,
		alt,
		poster,
		width,
		height,
		autoRotate,
		cameraControls,
		arMode,
		loading,
		reveal,
		showInstructions
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: 'model-viewer-block'
	} );

	if ( ! src ) {
		return null;
	}

	// Build the model-viewer attributes object
	const modelViewerProps = {
		src,
		alt: alt || 'Interactive 3D model',
		style: {
			width: width || '100%',
			height: height || '400px'
		}
	};

	// Add optional attributes only if they're set
	if ( poster ) {
		modelViewerProps.poster = poster;
	}
	
	if ( autoRotate ) {
		modelViewerProps['auto-rotate'] = '';
	}
	
	if ( cameraControls ) {
		modelViewerProps['camera-controls'] = '';
	}
	
	if ( arMode ) {
		modelViewerProps.ar = '';
		modelViewerProps['ar-modes'] = 'webxr scene-viewer quick-look';
	}
	
	if ( loading && loading !== 'auto' ) {
		modelViewerProps.loading = loading;
	}
	
	if ( reveal && reveal !== 'auto' ) {
		modelViewerProps.reveal = reveal;
	}

	// Build accessibility attributes
	const accessibilityProps = {
		role: 'img',
		tabIndex: '0',
		'aria-label': alt || 'Interactive 3D model - use arrow keys or mouse to interact',
	};

	// Combine all props for model-viewer
	const allModelViewerProps = {
		...modelViewerProps,
		...accessibilityProps,
	};

	return (
		<div { ...blockProps }>
			{ showInstructions && cameraControls && (
				<div className="model-viewer-instructions" role="region" aria-label="3D Model Controls">
					<div className="instructions-content">
						<h4>How to interact with this 3D model:</h4>
						<ul>
							<li><strong>Mouse:</strong> Click and drag to rotate • Scroll to zoom • Right-click and drag to pan</li>
							<li><strong>Touch:</strong> Tap and drag to rotate • Pinch to zoom • Two-finger drag to pan</li>
							<li><strong>Keyboard:</strong> Arrow keys to rotate • page up/down to zoom</li>
						</ul>
					</div>
				</div>
			) }
			<model-viewer { ...allModelViewerProps }>
				<div 
					slot="fallback"
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '200px',
						backgroundColor: '#f0f0f0',
						border: '2px dashed #ccc',
						color: '#666',
						textAlign: 'center',
						padding: '20px'
					}}
				>
					<p>
						Your browser doesn't support 3D model viewing. 
						<br />
						{ alt && <span>Model description: { alt }</span> }
					</p>
				</div>
				
				{ ! poster && (
					<div 
						slot="poster" 
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							minHeight: '200px',
							backgroundColor: '#f8f9fa',
							color: '#666',
							fontSize: '14px'
						}}
					>
						<div>Loading 3D model...</div>
					</div>
				) }
			</model-viewer>
		</div>
	);
} 