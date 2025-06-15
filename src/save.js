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
		reveal
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
				
				<div 
					slot="poster" 
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '200px',
						backgroundColor: '#f8f9fa'
					}}
				>
					<div>Loading 3D model...</div>
				</div>
			</model-viewer>
		</div>
	);
} 