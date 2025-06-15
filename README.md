# 3D Model Viewer Block

A WordPress block plugin for viewing 3D models using Google's model-viewer component. Built with wp-scripts, featuring multilingual support and WCAG AA compliance.

## Features

- **Easy 3D Model Integration**: Upload and display 3D models (.glb, .gltf) directly in the WordPress block editor
- **Google Model Viewer**: Powered by Google's robust model-viewer web component
- **Accessibility Compliant**: WCAG AA compliant with proper ARIA labels, keyboard navigation, and screen reader support
- **Multilingual Ready**: Full internationalization support with translation files
- **Responsive Design**: Works seamlessly across all device sizes
- **AR Support**: Augmented reality viewing on supported devices
- **Customizable**: Multiple configuration options for dimensions, interactions, and loading behavior

## Requirements

- WordPress 6.1 or higher
- PHP 7.4 or higher
- Modern browser with WebGL support

## Installation

### From Source

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. Upload the plugin folder to your WordPress `/wp-content/plugins/` directory
5. Activate the plugin through the 'Plugins' menu in WordPress

## Development

### Prerequisites

- Node.js 14+ and npm
- WordPress development environment

### Setup

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd model-viewer-block
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm start
   ```

### Available Scripts

- `npm start` - Start development mode with hot reloading
- `npm run build` - Build for production
- `npm run format` - Format code using WordPress standards
- `npm run lint:css` - Lint CSS/SCSS files
- `npm run lint:js` - Lint JavaScript files
- `npm run plugin-zip` - Create a plugin zip file for distribution

## Usage

1. In the WordPress block editor, add a new block
2. Search for "3D Model Viewer" or find it in the Media category
3. Upload your 3D model file (.glb or .gltf format recommended)
4. Configure the display options in the block settings:
   - **Alt Text**: Add descriptive text for accessibility
   - **Poster Image**: Optional loading image
   - **Dimensions**: Set custom width and height
   - **Auto Rotate**: Enable automatic model rotation
   - **Camera Controls**: Allow user interaction with mouse/touch
   - **AR Mode**: Enable augmented reality viewing
   - **Loading**: Control when the model loads (auto, lazy, eager)
   - **Reveal**: Control when the model is revealed

## Supported File Formats

- **.glb** (recommended) - Binary glTF
- **.gltf** - Text-based glTF with separate assets

For best performance, use .glb files which are compressed and contain all assets in a single file.

## Accessibility Features

This plugin is designed with accessibility in mind:

- **WCAG AA Compliance**: Meets Web Content Accessibility Guidelines
- **Keyboard Navigation**: Full keyboard support with proper focus management
- **Screen Reader Support**: Descriptive ARIA labels and alternative text
- **High Contrast Mode**: Supports high contrast display preferences
- **Reduced Motion**: Respects user's motion preferences
- **Fallback Content**: Graceful degradation for unsupported browsers

## Internationalization

The plugin is translation-ready with:

- Complete translation template (`languages/model-viewer-block.pot`)
- Text domain: `model-viewer-block`
- All user-facing strings properly internationalized

To contribute translations, translate the `.pot` file and save as `.po` and `.mo` files in the `languages` directory.

## Browser Support

- Chrome 67+
- Firefox 65+
- Safari 12.1+
- Edge 79+

The model-viewer component requires WebGL support. On unsupported browsers, fallback content is displayed.

## File Structure

```
model-viewer-block/
├── src/
│   ├── block.json          # Block configuration
│   ├── index.js           # Main block registration
│   ├── edit.js            # Block editor component
│   ├── save.js            # Frontend save component
│   ├── style.scss         # Frontend & editor styles
│   └── editor.scss        # Editor-only styles
├── languages/
│   └── model-viewer-block.pot  # Translation template
├── model-viewer-block.php      # Main plugin file
├── package.json               # Build configuration
└── README.md                  # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests and linting: `npm run lint:js && npm run lint:css`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is licensed under the GPL-2.0-or-later License - see the WordPress plugin guidelines for details.

## Support

For support, feature requests, or bug reports, please create an issue in the project repository.

## Credits

- Built with [WordPress Scripts](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/)
- Powered by [Google Model Viewer](https://modelviewer.dev/)
- Follows [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)

## Changelog

### 1.0.0
- Initial release
- 3D model viewing with Google model-viewer
- Full accessibility compliance (WCAG AA)
- Internationalization support
- Responsive design
- AR support
- Comprehensive block settings 