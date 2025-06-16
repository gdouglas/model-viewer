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
		this.wrapper = element.querySelector('.model-viewer-wrapper');
		
		this.isFullscreenActive = false;
		this.originalStyles = null;
		
		this.init();
	}
	
	init() {
		if (this.loadButton) {
			this.setupInteractionMode();
		}
		
		if (this.fullscreenButton) {
			this.setupFullscreen();
		}
	}
	
	setupInteractionMode() {
		this.loadButton.addEventListener('click', () => {
			this.showLoadingState();
			this.modelViewer.dismissPoster();
		});
		
		// Listen for model-viewer specific events
		this.modelViewer.addEventListener('load', () => {
			this.hideLoadingState();
		});
		
		this.modelViewer.addEventListener('model-visibility', (event) => {
			if (event.detail.visible) {
				this.hideLoadingState();
			}
		});
		
		this.modelViewer.addEventListener('error', () => {
			this.showErrorState();
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