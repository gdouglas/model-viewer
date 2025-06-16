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
		loadingMode,
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

	// Map loadingMode to internal loading and reveal attributes
	const loading = loadingMode === 'auto' ? 'eager' : 'lazy';
	const reveal = loadingMode === 'auto' ? 'auto' : 'manual';

	// Add optional attributes only if they're set
	// Don't set poster attribute when using interaction mode (we handle it via slot)
	if ( poster && loadingMode !== 'interaction' ) {
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

	// Generate unique ID for this model viewer instance
	const modelViewerId = `model-viewer-${Math.random().toString(36).substr(2, 9)}`;
	const buttonId = `button-load-${Math.random().toString(36).substr(2, 9)}`;

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
			<model-viewer id={modelViewerId} { ...allModelViewerProps }>
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
				
				{ loadingMode === 'interaction' && (
					<>
						<div 
							slot="poster"
							style={{
								position: 'absolute',
								left: '0',
								right: '0',
								top: '0',
								bottom: '0',
								backgroundImage: poster ? `url(${poster})` : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
								backgroundSize: poster ? 'contain' : 'cover',
								backgroundRepeat: 'no-repeat',
								backgroundPosition: 'center',
								border: !poster ? '2px dashed #dee2e6' : 'none'
							}}
						/>
						<button
							id={buttonId}
							slot="poster"
							style={{
								backgroundColor: '#007cba',
								color: 'white',
								cursor: 'pointer',
								borderRadius: '8px',
								border: 'none',
								display: 'inline-flex',
								alignItems: 'center',
								gap: '8px',
								padding: '12px 20px',
								fontSize: '16px',
								fontWeight: '600',
								boxShadow: '0 4px 12px rgba(0, 124, 186, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15)',
								position: 'absolute',
								left: '50%',
								top: '50%',
								transform: 'translate(-50%, -50%)',
								zIndex: '100',
								transition: 'all 0.2s ease'
							}}
							onMouseOver={(e) => {
								e.target.style.backgroundColor = '#005a87';
								e.target.style.transform = 'translate(-50%, -50%) scale(1.05)';
							}}
							onMouseOut={(e) => {
								e.target.style.backgroundColor = '#007cba';
								e.target.style.transform = 'translate(-50%, -50%) scale(1)';
							}}
							aria-label="Load 3D model"
						>
							<span style={{ fontSize: '20px' }}>▶️</span>
							Load 3D Model
						</button>
					</>
				) }
				
				{ ! poster && loadingMode !== 'interaction' && (
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
			
			{ loadingMode === 'interaction' && (
				<script
					dangerouslySetInnerHTML={{
						__html: `
							document.addEventListener('DOMContentLoaded', function() {
								const button = document.getElementById('${buttonId}');
								const modelViewer = document.getElementById('${modelViewerId}');
								if (button && modelViewer) {
									button.addEventListener('click', function() {
										modelViewer.dismissPoster();
									});
								}
							});
						`
					}}
				/>
			) }
		</div>
	);
} 