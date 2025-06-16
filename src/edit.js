/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';

/**
 * WordPress components
 */
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
	Button,
	Placeholder,
	Spinner,
	Notice
} from '@wordpress/components';

/**
 * React hooks
 */
import { useState, useEffect } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
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
		showControls,
		showInstructions
	} = attributes;

	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);

	const blockProps = useBlockProps( {
		className: 'model-viewer-block-editor'
	} );

	// Load Google Model Viewer in editor
	useEffect(() => {
		if (!window.customElements.get('model-viewer')) {
			const script = document.createElement('script');
			script.type = 'module';
			script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
			document.head.appendChild(script);
		}
	}, []);

	const onSelectModel = (media) => {
		setAttributes({ 
			src: media.url,
			alt: media.alt || ''
		});
	};

	const onRemoveModel = () => {
		setAttributes({ 
			src: '',
			alt: '',
			poster: ''
		});
	};

	const ModelViewer = () => {
		if (!src) {
			return (
				<MediaUploadCheck>
					<MediaUpload
						onSelect={onSelectModel}
						allowedTypes={['model']}
						value={src}
						render={({ open }) => (
							<Placeholder
								icon="format-video"
								label={__('3D Model Viewer', 'model-viewer-block')}
								instructions={__('Upload a 3D model file (.glb, .gltf) to get started.', 'model-viewer-block')}
							>
								<Button
									variant="primary"
									onClick={open}
									aria-label={__('Upload 3D model', 'model-viewer-block')}
								>
									{__('Upload Model', 'model-viewer-block')}
								</Button>
							</Placeholder>
						)}
					/>
				</MediaUploadCheck>
			);
		}

		return (
			<div className="model-viewer-container">
				{isLoading && (
					<div className="model-viewer-loading">
						<Spinner /> {__('Loading 3D model...', 'model-viewer-block')}
					</div>
				)}
				{hasError && (
					<Notice status="error" isDismissible={false}>
						{__('Error loading 3D model. Please check the file format and try again.', 'model-viewer-block')}
					</Notice>
				)}
				{loadingMode === 'interaction' && (
					<div className="model-viewer-reveal-notice" style={{
						background: '#e3f2fd',
						border: '1px solid #2196f3',
						borderRadius: '4px',
						padding: '12px',
						marginBottom: '12px',
						color: '#1565c0',
						fontSize: '14px'
					}}>
						<strong>{__('Loading Mode: Interaction', 'model-viewer-block')}</strong><br />
						{__('On the frontend, users will need to click the button to load the 3D model', 'model-viewer-block')}
					</div>
				)}
				{showInstructions && cameraControls && (
					<div className="model-viewer-instructions" role="region" aria-label={__('3D Model Controls', 'model-viewer-block')}>
						<div className="instructions-content">
							<h4>{__('How to interact with this 3D model:', 'model-viewer-block')}</h4>
							<ul>
								<li><strong>{__('Mouse:', 'model-viewer-block')}</strong> {__('Click and drag to rotate • Scroll to zoom • Right-click and drag to pan', 'model-viewer-block')}</li>
								<li><strong>{__('Touch:', 'model-viewer-block')}</strong> {__('Tap and drag to rotate • Pinch to zoom • Two-finger drag to pan', 'model-viewer-block')}</li>
								<li><strong>{__('Keyboard:', 'model-viewer-block')}</strong> {__('Arrow keys to rotate • page up/down to zoom', 'model-viewer-block')}</li>
							</ul>
						</div>
					</div>
				)}
				<model-viewer
					src={src}
					alt={alt || __('3D Model', 'model-viewer-block')}
					poster={poster}
					style={{ 
						width: width,
						height: height,
						display: hasError ? 'none' : 'block'
					}}
					auto-rotate={autoRotate}
					camera-controls={cameraControls}
					ar={arMode}
					loading={loadingMode === 'auto' ? 'eager' : 'lazy'}
					reveal={loadingMode === 'auto' ? 'auto' : 'manual'}
					onLoad={() => setIsLoading(false)}
					onError={() => {
						setIsLoading(false);
						setHasError(true);
					}}
					onModelLoad={() => setIsLoading(false)}
				></model-viewer>
				<div className="model-viewer-actions">
					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectModel}
							allowedTypes={['model']}
							value={src}
							render={({ open }) => (
								<Button
									variant="secondary"
									onClick={open}
									aria-label={__('Replace 3D model', 'model-viewer-block')}
								>
									{__('Replace Model', 'model-viewer-block')}
								</Button>
							)}
						/>
					</MediaUploadCheck>
					<Button
						variant="secondary"
						onClick={onRemoveModel}
						isDestructive
						aria-label={__('Remove 3D model', 'model-viewer-block')}
					>
						{__('Remove Model', 'model-viewer-block')}
					</Button>
				</div>
			</div>
		);
	};

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Model Settings', 'model-viewer-block')}>
					<TextControl
						label={__('Alt Text', 'model-viewer-block')}
						value={alt}
						onChange={(value) => setAttributes({ alt: value })}
						help={__('Describe the 3D model for screen readers and accessibility', 'model-viewer-block')}
					/>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={(media) => setAttributes({ poster: media.url })}
							allowedTypes={['image']}
							value={poster}
							render={({ open }) => (
								<>
									<Button
										variant={poster ? 'secondary' : 'primary'}
										onClick={open}
									>
										{poster ? __('Replace Poster Image', 'model-viewer-block') : __('Add Poster Image', 'model-viewer-block')}
									</Button>
									{poster && (
										<Button
											variant="link"
											onClick={() => setAttributes({ poster: '' })}
											isDestructive
										>
											{__('Remove Poster', 'model-viewer-block')}
										</Button>
									)}
								</>
							)}
						/>
					</MediaUploadCheck>
				</PanelBody>
				
				<PanelBody title={__('Dimensions', 'model-viewer-block')} initialOpen={false}>
					<TextControl
						label={__('Width', 'model-viewer-block')}
						value={width}
						onChange={(value) => setAttributes({ width: value })}
						help={__('CSS width value (e.g., 100%, 500px)', 'model-viewer-block')}
					/>
					<TextControl
						label={__('Height', 'model-viewer-block')}
						value={height}
						onChange={(value) => setAttributes({ height: value })}
						help={__('CSS height value (e.g., 400px, 50vh)', 'model-viewer-block')}
					/>
				</PanelBody>

				<PanelBody title={__('Interaction Settings', 'model-viewer-block')} initialOpen={false}>
					<ToggleControl
						label={__('Auto Rotate', 'model-viewer-block')}
						checked={autoRotate}
						onChange={(value) => setAttributes({ autoRotate: value })}
						help={__('Automatically rotate the model', 'model-viewer-block')}
					/>
					<ToggleControl
						label={__('Camera Controls', 'model-viewer-block')}
						checked={cameraControls}
						onChange={(value) => setAttributes({ cameraControls: value })}
						help={__('Allow users to control the camera with mouse/touch', 'model-viewer-block')}
					/>
					<ToggleControl
						label={__('AR Mode', 'model-viewer-block')}
						checked={arMode}
						onChange={(value) => setAttributes({ arMode: value })}
						help={__('Enable augmented reality viewing on supported devices', 'model-viewer-block')}
					/>
					<ToggleControl
						label={__('Show Control Instructions', 'model-viewer-block')}
						checked={showInstructions}
						onChange={(value) => setAttributes({ showInstructions: value })}
						help={__('Display instructions on how to interact with the 3D model', 'model-viewer-block')}
					/>
				</PanelBody>

				<PanelBody title={__('Loading Behavior', 'model-viewer-block')} initialOpen={false}>
					<SelectControl
						label={__('Loading Mode', 'model-viewer-block')}
						value={loadingMode}
						options={[
							{ label: __('Auto', 'model-viewer-block'), value: 'auto' },
							{ label: __('Interaction', 'model-viewer-block'), value: 'interaction' }
						]}
						onChange={(value) => setAttributes({ loadingMode: value })}
						help={
							loadingMode === 'interaction' 
								? __('Model will only load when user clicks the "Load 3D Model" button. Uses lazy loading for better performance.', 'model-viewer-block')
								: __('Model will load and display automatically when the page loads. Uses eager loading.', 'model-viewer-block')
						}
					/>
				</PanelBody>
			</InspectorControls>

			<ModelViewer />
		</div>
	);
} 