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
import { useState, useEffect, useCallback } from '@wordpress/element';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * Loading Notice Component
 */
const LoadingNotice = () => (
	<div className="model-viewer-loading">
		<Spinner /> {__('Loading 3D model...', 'model-viewer-block')}
	</div>
);

/**
 * Error Notice Component
 */
const ErrorNotice = () => (
	<Notice status="error" isDismissible={false}>
		{__('Error loading 3D model. Please check the file format and try again.', 'model-viewer-block')}
	</Notice>
);

/**
 * Interaction Mode Notice Component
 */
const InteractionModeNotice = () => (
	<div className="model-viewer-reveal-notice">
		<strong>{__('Loading Mode: Interaction', 'model-viewer-block')}</strong><br />
		{__('On the frontend, users will need to click the button to load the 3D model', 'model-viewer-block')}
	</div>
);

/**
 * Fullscreen Button Component
 */
const FullscreenButton = ({ showFullscreenButton, hasError }) => {
	const handleFullscreenClick = useCallback((e) => {
		e.preventDefault();
		// In editor, just show a notice that this works on frontend
		alert(__('Fullscreen mode is available on the frontend when viewing the published content.', 'model-viewer-block'));
	}, []);

	if (!showFullscreenButton || hasError) {
		return null;
	}

	return (
		<button
			className="model-viewer-fullscreen-btn model-viewer-fullscreen-btn--editor"
			onClick={handleFullscreenClick}
			title={__('Enter fullscreen mode', 'model-viewer-block')}
			aria-label={__('Enter fullscreen mode', 'model-viewer-block')}
		>
			⛶
		</button>
	);
};

/**
 * Reset Camera Button Component
 */
const ResetButton = ({ showResetButton, hasError, cameraControls }) => {
	const handleResetClick = useCallback((e) => {
		e.preventDefault();
		// In editor, just show a notice that this works on frontend
		alert(__('Camera reset is available on the frontend when viewing the published content.', 'model-viewer-block'));
	}, []);

	if (!showResetButton || hasError || !cameraControls) {
		return null;
	}

	return (
		<button
			className="model-viewer-reset-btn model-viewer-reset-btn--editor"
			onClick={handleResetClick}
			title={__('Reset camera position', 'model-viewer-block')}
			aria-label={__('Reset camera position', 'model-viewer-block')}
		>
			{__('Reset View', 'model-viewer-block')}
		</button>
	);
};

/**
 * Model Actions Component
 */
const ModelActions = ({ onSelectModel, onRemoveModel, src }) => (
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
);

/**
 * Instructions Component
 */
const Instructions = ({ showInstructions, cameraControls }) => {
	if (!showInstructions || !cameraControls) {
		return null;
	}

	return (
		<figcaption className="model-viewer-instructions">
			<div className="instructions-content">
				<h3 className="model-viewer-instructions-heading">
					{__('How to interact with this 3D model:', 'model-viewer-block')}
				</h3>
				<ul>
					<li>
						<strong>{__('Mouse:', 'model-viewer-block')}</strong> {__('Click and drag to rotate • Scroll to zoom • Right-click and drag to pan', 'model-viewer-block')}
					</li>
					<li>
						<strong>{__('Touch:', 'model-viewer-block')}</strong> {__('Tap and drag to rotate • Pinch to zoom • Two-finger drag to pan', 'model-viewer-block')}
					</li>
					<li>
						<strong>{__('Keyboard:', 'model-viewer-block')}</strong> {__('Arrow keys to rotate • page up/down to zoom', 'model-viewer-block')}
					</li>
				</ul>
			</div>
		</figcaption>
	);
};

/**
 * Model Upload Placeholder Component
 */
const ModelUploadPlaceholder = ({ onSelectModel, src }) => (
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

/**
 * Model Viewer Component
 */
const ModelViewer = ({ attributes, onSelectModel, onRemoveModel }) => {
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
		showInstructions,
		showFullscreenButton,
		showResetButton
	} = attributes;

	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);

	const handleLoad = useCallback(() => setIsLoading(false), []);
	const handleError = useCallback(() => {
		setIsLoading(false);
		setHasError(true);
	}, []);

	// Reset error state when src changes
	useEffect(() => {
		if (src) {
			setHasError(false);
			setIsLoading(true);
		}
	}, [src]);

	if (!src) {
		return <ModelUploadPlaceholder onSelectModel={onSelectModel} src={src} />;
	}

	const modelViewerStyle = {
		width: width,
		height: height,
		display: hasError ? 'none' : 'block'
	};

	return (
		<figure className="model-viewer-container">
			{isLoading && <LoadingNotice />}
			{hasError && <ErrorNotice />}
			{loadingMode === 'interaction' && <InteractionModeNotice />}
			
			<div className="model-viewer-wrapper">
				<model-viewer
					src={src}
					alt={alt || __('3D Model', 'model-viewer-block')}
					poster={poster}
					style={modelViewerStyle}
					auto-rotate={autoRotate}
					camera-controls={cameraControls}
					ar={arMode}
					loading={loadingMode === 'auto' ? 'eager' : 'lazy'}
					reveal={loadingMode === 'auto' ? 'auto' : 'manual'}
					onLoad={handleLoad}
					onError={handleError}
					onModelLoad={handleLoad}
				></model-viewer>
				
				<FullscreenButton 
					showFullscreenButton={showFullscreenButton} 
					hasError={hasError} 
				/>
				
				<ResetButton 
					showResetButton={showResetButton} 
					hasError={hasError} 
					cameraControls={cameraControls}
				/>
			</div>
			
			<ModelActions 
				onSelectModel={onSelectModel} 
				onRemoveModel={onRemoveModel} 
				src={src} 
			/>
			
			<Instructions 
				showInstructions={showInstructions} 
				cameraControls={cameraControls} 
			/>
		</figure>
	);
};

/**
 * Model Settings Panel Component
 */
const ModelSettingsPanel = ({ attributes, setAttributes }) => {
	const { alt, poster } = attributes;

	const handlePosterSelect = useCallback((media) => {
		setAttributes({ poster: media.url });
	}, [setAttributes]);

	const handlePosterRemove = useCallback(() => {
		setAttributes({ poster: '' });
	}, [setAttributes]);

	const handleAltChange = useCallback((value) => {
		setAttributes({ alt: value });
	}, [setAttributes]);

	return (
		<PanelBody title={__('Model Settings', 'model-viewer-block')}>
			<TextControl
				label={__('Alt Text', 'model-viewer-block')}
				value={alt}
				onChange={handleAltChange}
				help={__('Describe the 3D model for screen readers and accessibility', 'model-viewer-block')}
			/>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={handlePosterSelect}
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
									onClick={handlePosterRemove}
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
	);
};

/**
 * Dimensions Panel Component
 */
const DimensionsPanel = ({ attributes, setAttributes }) => {
	const { width, height } = attributes;

	const handleWidthChange = useCallback((value) => {
		setAttributes({ width: value });
	}, [setAttributes]);

	const handleHeightChange = useCallback((value) => {
		setAttributes({ height: value });
	}, [setAttributes]);

	return (
		<PanelBody title={__('Dimensions', 'model-viewer-block')} initialOpen={false}>
			<TextControl
				label={__('Width', 'model-viewer-block')}
				value={width}
				onChange={handleWidthChange}
				help={__('CSS width value (e.g., 100%, 500px)', 'model-viewer-block')}
			/>
			<TextControl
				label={__('Height', 'model-viewer-block')}
				value={height}
				onChange={handleHeightChange}
				help={__('CSS height value (e.g., 400px, 50vh)', 'model-viewer-block')}
			/>
		</PanelBody>
	);
};

/**
 * Interaction Settings Panel Component
 */
const InteractionSettingsPanel = ({ attributes, setAttributes }) => {
	const { autoRotate, cameraControls, arMode, showInstructions, showFullscreenButton, showResetButton } = attributes;

	const handleAutoRotateChange = useCallback((value) => {
		setAttributes({ autoRotate: value });
	}, [setAttributes]);

	const handleCameraControlsChange = useCallback((value) => {
		setAttributes({ cameraControls: value });
	}, [setAttributes]);

	const handleArModeChange = useCallback((value) => {
		setAttributes({ arMode: value });
	}, [setAttributes]);

	const handleShowInstructionsChange = useCallback((value) => {
		setAttributes({ showInstructions: value });
	}, [setAttributes]);

	const handleShowFullscreenButtonChange = useCallback((value) => {
		setAttributes({ showFullscreenButton: value });
	}, [setAttributes]);

	const handleShowResetButtonChange = useCallback((value) => {
		setAttributes({ showResetButton: value });
	}, [setAttributes]);

	return (
		<PanelBody title={__('Interaction Settings', 'model-viewer-block')} initialOpen={false}>
			<ToggleControl
				label={__('Auto Rotate', 'model-viewer-block')}
				checked={autoRotate}
				onChange={handleAutoRotateChange}
				help={__('Automatically rotate the model', 'model-viewer-block')}
			/>
			<ToggleControl
				label={__('Camera Controls', 'model-viewer-block')}
				checked={cameraControls}
				onChange={handleCameraControlsChange}
				help={__('Allow users to control the camera with mouse/touch', 'model-viewer-block')}
			/>
			<ToggleControl
				label={__('AR Mode', 'model-viewer-block')}
				checked={arMode}
				onChange={handleArModeChange}
				help={__('Enable augmented reality viewing on supported devices', 'model-viewer-block')}
			/>
			<ToggleControl
				label={__('Show Control Instructions', 'model-viewer-block')}
				checked={showInstructions}
				onChange={handleShowInstructionsChange}
				help={__('Display instructions on how to interact with the 3D model', 'model-viewer-block')}
			/>
			<ToggleControl
				label={__('Show Fullscreen Button', 'model-viewer-block')}
				checked={showFullscreenButton}
				onChange={handleShowFullscreenButtonChange}
				help={__('Display a button to view the 3D model in fullscreen mode', 'model-viewer-block')}
			/>
			<ToggleControl
				label={__('Show Reset Camera Button', 'model-viewer-block')}
				checked={showResetButton}
				onChange={handleShowResetButtonChange}
				help={__('Display a button to reset the camera to its default position', 'model-viewer-block')}
			/>
		</PanelBody>
	);
};

/**
 * Loading Behavior Panel Component
 */
const LoadingBehaviorPanel = ({ attributes, setAttributes }) => {
	const { loadingMode } = attributes;

	const handleLoadingModeChange = useCallback((value) => {
		setAttributes({ loadingMode: value });
	}, [setAttributes]);

	return (
		<PanelBody title={__('Loading Behavior', 'model-viewer-block')} initialOpen={false}>
			<SelectControl
				label={__('Loading Mode', 'model-viewer-block')}
				value={loadingMode}
				options={[
					{ label: __('Auto', 'model-viewer-block'), value: 'auto' },
					{ label: __('Interaction', 'model-viewer-block'), value: 'interaction' }
				]}
				onChange={handleLoadingModeChange}
				help={
					loadingMode === 'interaction' 
						? __('Model will only load when user clicks the "Load 3D Model" button. Uses lazy loading for better performance.', 'model-viewer-block')
						: __('Model will load and display automatically when the page loads. Uses eager loading.', 'model-viewer-block')
				}
			/>
		</PanelBody>
	);
};

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object} props Block props
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
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

	const handleSelectModel = useCallback((media) => {
		setAttributes({ 
			src: media.url,
			alt: media.alt || ''
		});
	}, [setAttributes]);

	const handleRemoveModel = useCallback(() => {
		setAttributes({ 
			src: '',
			alt: '',
			poster: ''
		});
	}, [setAttributes]);

	return (
		<div {...blockProps}>
			<InspectorControls>
				<ModelSettingsPanel attributes={attributes} setAttributes={setAttributes} />
				<DimensionsPanel attributes={attributes} setAttributes={setAttributes} />
				<InteractionSettingsPanel attributes={attributes} setAttributes={setAttributes} />
				<LoadingBehaviorPanel attributes={attributes} setAttributes={setAttributes} />
			</InspectorControls>

			<ModelViewer 
				attributes={attributes}
				onSelectModel={handleSelectModel}
				onRemoveModel={handleRemoveModel}
			/>
		</div>
	);
}