/**
 * Frontend JavaScript for Model Viewer Block
 * Uses modern ES modules and WordPress script modules
 */

class ModelViewerBlock {
	constructor(element) {
		this.element = element;
		this.modelViewer = element.querySelector('model-viewer');
		this.loadButton = element.querySelector('[data-load-button]');
		this.fullscreenButton = element.querySelector('[data-fullscreen-button]');
		this.resetButton = element.querySelector('[data-reset-button]');
		this.wrapper = element.querySelector('.model-viewer-wrapper');
		this.loadingPoster = element.querySelector('.model-viewer-loading-poster');
		this.fallbackContent = element.querySelector('.model-viewer-fallback');
		
		this.isFullscreenActive = false;
		this.originalStyles = null;
		this.initialCameraState = null;
		
		this.init();
	}
	
	init() {
		if (this.loadButton) {
			this.setupInteractionMode();
		}
		
		if (this.fullscreenButton) {
			this.setupFullscreen();
		}
		
		if (this.resetButton) {
			this.setupReset();
		}
		
		// Store initial camera state when model loads
		this.storeInitialCameraState();
		
		// Hide fallback content if loading poster is present
		this.hideFallbackDuringLoading();
	}
	
	setupInteractionMode() {
		this.loadButton.addEventListener('click', () => {
			this.showLoadingState();
			this.modelViewer.dismissPoster();
		});
		
		// Listen for model-viewer specific events
		this.modelViewer.addEventListener('load', () => {
			this.hideLoadingState();
			this.hideLoadingPoster();
		});
		
		this.modelViewer.addEventListener('model-visibility', (event) => {
			if (event.detail.visible) {
				this.hideLoadingState();
				this.hideLoadingPoster();
			}
		});
		
		this.modelViewer.addEventListener('error', () => {
			this.showErrorState();
			this.hideLoadingPoster();
			// On error, show fallback content if browser doesn't support model-viewer
			setTimeout(() => {
				this.showFallbackContent();
			}, 100);
		});
		
		// Also listen for poster dismiss to start loading state
		this.modelViewer.addEventListener('poster-dismissed', () => {
			// If we haven't shown loading state yet, show it now
			if (!this.loadButton.disabled) {
				this.showLoadingState();
			}
		});
	}
	
	showLoadingState() {
		// Change button to loading state
		this.loadButton.innerHTML = `
			<div class="model-viewer-spinner"></div>
			Loading 3D Model...
		`;
		this.loadButton.disabled = true;
		this.loadButton.style.cursor = 'not-allowed';
		this.loadButton.style.opacity = '0.8';
		this.loadButton.setAttribute('aria-label', 'Loading 3D model, please wait');
	}
	
	hideLoadingState() {
		// Hide the entire load button since model is now loaded
		if (this.loadButton) {
			this.loadButton.style.display = 'none';
		}
	}
	
	hideLoadingPoster() {
		// Hide the loading poster when model is loaded (for auto loading mode without poster)
		if (this.loadingPoster) {
			this.loadingPoster.style.display = 'none';
		}
		
		// Show fallback content again if it was hidden
		this.showFallbackContent();
	}
	
	hideFallbackDuringLoading() {
		// Hide fallback content when there's a loading poster to prevent brief flash
		if (this.loadingPoster && this.fallbackContent) {
			this.fallbackContent.classList.add('hidden-during-loading');
			this.wrapper.classList.add('has-loading-poster');
		}
	}
	
	showFallbackContent() {
		// Show fallback content again (in case model fails to load)
		if (this.fallbackContent && this.loadingPoster) {
			// Only show fallback if loading poster is hidden and model failed to load
			const loadingPosterHidden = this.loadingPoster.style.display === 'none';
			if (loadingPosterHidden) {
				this.fallbackContent.classList.remove('hidden-during-loading');
				this.wrapper.classList.remove('has-loading-poster');
			}
		}
	}
	
	showErrorState() {
		// Show error state
		this.loadButton.innerHTML = `
			<span style="color: #d63638;">⚠️</span>
			Failed to Load
		`;
		this.loadButton.disabled = true;
		this.loadButton.style.cursor = 'not-allowed';
		this.loadButton.style.backgroundColor = '#f0f0f0';
		this.loadButton.style.color = '#666';
		this.loadButton.setAttribute('aria-label', 'Failed to load 3D model');
	}
	
	setupFullscreen() {
		// Check if Fullscreen API is supported
		const fullscreenSupported = !!(
			document.fullscreenEnabled ||
			document.webkitFullscreenEnabled ||
			document.mozFullScreenEnabled ||
			document.msFullscreenEnabled
		);
		
		if (!fullscreenSupported) {
			this.fullscreenButton.style.display = 'none';
			return;
		}
		
		this.fullscreenButton.addEventListener('click', () => {
			if (this.isFullscreenActive) {
				this.exitFullscreen();
			} else {
				this.enterFullscreen();
			}
		});
		
		// Listen for fullscreen changes
		document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
		document.addEventListener('webkitfullscreenchange', () => this.handleFullscreenChange());
		document.addEventListener('msfullscreenchange', () => this.handleFullscreenChange());
	}
	
	enterFullscreen() {
		// If in interaction mode and model hasn't loaded yet, load it first
		if (this.modelViewer.hasAttribute('reveal') && this.modelViewer.getAttribute('reveal') === 'manual') {
			const posterSlot = this.modelViewer.querySelector('[slot="poster"]');
			if (posterSlot && posterSlot.style.display !== 'none') {
				this.modelViewer.dismissPoster();
			}
		}
		
		if (this.wrapper.requestFullscreen) {
			this.wrapper.requestFullscreen();
		} else if (this.wrapper.webkitRequestFullscreen) {
			this.wrapper.webkitRequestFullscreen();
		} else if (this.wrapper.msRequestFullscreen) {
			this.wrapper.msRequestFullscreen();
		}
	}
	
	exitFullscreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	}
	
	handleFullscreenChange() {
		this.isFullscreenActive = document.fullscreenElement === this.wrapper ||
								  document.webkitFullscreenElement === this.wrapper ||
								  document.msFullscreenElement === this.wrapper;
		
		if (this.isFullscreenActive) {
			this.wrapper.classList.add('is-fullscreen');
			this.storeAndApplyFullscreenStyles();
		} else {
			this.wrapper.classList.remove('is-fullscreen');
			this.restoreOriginalStyles();
		}
		
		this.updateFullscreenButton();
	}
	
	storeAndApplyFullscreenStyles() {
		if (!this.originalStyles) {
			this.originalStyles = {
				width: this.modelViewer.style.width,
				height: this.modelViewer.style.height
			};
		}
		this.modelViewer.style.width = '100vw';
		this.modelViewer.style.height = '100vh';
	}
	
	restoreOriginalStyles() {
		if (this.originalStyles) {
			this.modelViewer.style.width = this.originalStyles.width;
			this.modelViewer.style.height = this.originalStyles.height;
		}
	}
	
	updateFullscreenButton() {
		const title = this.isFullscreenActive ? 'Exit fullscreen mode' : 'Enter fullscreen mode';
		this.fullscreenButton.title = title;
		this.fullscreenButton.setAttribute('aria-label', title);
	}
	
	setupReset() {
		this.resetButton.addEventListener('click', () => {
			this.resetCamera();
		});
	}
	
	storeInitialCameraState() {
		if (this.modelViewer) {
			// Wait for model to load before storing initial state
			const storeState = () => {
				try {
					this.initialCameraState = {
						orbit: this.modelViewer.getCameraOrbit ? this.modelViewer.getCameraOrbit() : null,
						target: this.modelViewer.getCameraTarget ? this.modelViewer.getCameraTarget() : null,
						fov: this.modelViewer.getFieldOfView ? this.modelViewer.getFieldOfView() : null,
						// Store attribute values as backup
						orbitAttr: this.modelViewer.getAttribute('camera-orbit'),
						targetAttr: this.modelViewer.getAttribute('camera-target'),
						fovAttr: this.modelViewer.getAttribute('field-of-view')
					};
				} catch (e) {
					// Fallback to attribute-based storage
					this.initialCameraState = {
						orbitAttr: this.modelViewer.getAttribute('camera-orbit'),
						targetAttr: this.modelViewer.getAttribute('camera-target'),
						fovAttr: this.modelViewer.getAttribute('field-of-view')
					};
				}
			};
			
			// Store state when model loads
			this.modelViewer.addEventListener('load', storeState);
			this.modelViewer.addEventListener('model-visibility', storeState);
			
			// Also store immediately if model is already loaded
			if (this.modelViewer.loaded) {
				storeState();
			}
		}
	}
	
	resetCamera() {
		// Reset ALL camera interactions to initial state
		if (this.modelViewer) {
			// Method 1: Force reset using attribute manipulation
			// Set camera-orbit to auto to reset rotation
			this.modelViewer.setAttribute('camera-orbit', 'auto auto auto');
			this.modelViewer.setAttribute('camera-target', 'auto auto auto');
			this.modelViewer.setAttribute('field-of-view', 'auto');
			
			// Force a re-render by triggering model-viewer's internal update
			setTimeout(() => {
				// Method 2: Remove attributes to force default behavior
				this.modelViewer.removeAttribute('camera-orbit');
				this.modelViewer.removeAttribute('camera-target');
				this.modelViewer.removeAttribute('field-of-view');
			}, 10);
			
			// Method 3: Reset turntable rotation
			if (typeof this.modelViewer.resetTurntableRotation === 'function') {
				this.modelViewer.resetTurntableRotation();
			}
			
			// Method 4: Jump to goal state
			if (typeof this.modelViewer.jumpCameraToGoal === 'function') {
				this.modelViewer.jumpCameraToGoal();
			}
			
			// Method 5: Force re-framing
			if (typeof this.modelViewer.updateFraming === 'function') {
				this.modelViewer.updateFraming();
			}
			
			// Method 6: Access and reset internal camera state
			try {
				// Force a complete scene update
				if (this.modelViewer.model && this.modelViewer.model.scene) {
					this.modelViewer.model.scene.updateMatrixWorld(true);
				}
				
				// Force render
				if (this.modelViewer.renderer) {
					this.modelViewer.renderer.render(this.modelViewer.model.scene, this.modelViewer.camera);
				}
			} catch (e) {
				// Ignore errors from internal API access
			}
			
			// Method 7: Force complete reset by re-initializing the model-viewer
			try {
				const currentSrc = this.modelViewer.getAttribute('src');
				if (currentSrc) {
					// Temporarily remove src to force re-initialization
					this.modelViewer.removeAttribute('src');
					
					// Wait a moment then restore src
					setTimeout(() => {
						this.modelViewer.setAttribute('src', currentSrc);
					}, 50);
				}
			} catch (e) {
				// Ignore errors from re-initialization
			}
		}
		
		// Method 8: Force a complete reset by dispatching events
		setTimeout(() => {
			if (this.modelViewer) {
				// Dispatch multiple events to trigger internal resets
				this.modelViewer.dispatchEvent(new CustomEvent('camera-change'));
				this.modelViewer.dispatchEvent(new CustomEvent('load'));
				this.modelViewer.dispatchEvent(new CustomEvent('model-visibility'));
				
				// Force recalculation of the default camera position
				if (typeof this.modelViewer.updateFraming === 'function') {
					this.modelViewer.updateFraming();
				}
			}
		}, 150);
		
		// Provide visual feedback
		this.showResetFeedback();
	}
	
	showResetFeedback() {
		// Temporarily change the button to show feedback
		const originalContent = this.resetButton.innerHTML;
		const originalBackground = this.resetButton.style.backgroundColor;
		
		this.resetButton.innerHTML = 'Reset ✓';
		this.resetButton.style.backgroundColor = 'rgba(34, 197, 94, 0.9)';
		this.resetButton.disabled = true;
		
		setTimeout(() => {
			this.resetButton.innerHTML = originalContent;
			this.resetButton.style.backgroundColor = originalBackground || 'rgba(0, 0, 0, 0.7)';
			this.resetButton.disabled = false;
		}, 800);
	}
}

// Initialize all model viewer blocks on the page
function initModelViewerBlocks() {
	const blocks = document.querySelectorAll('.model-viewer-block');
	blocks.forEach(block => new ModelViewerBlock(block));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initModelViewerBlocks);
} else {
	initModelViewerBlocks();
} 