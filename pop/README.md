# Design-First Media Player

A beautiful, modern media player for streaming URLs with support for both standalone player and iframe embed modes. Built with a design-first approach, featuring reliable autoplay support especially optimized for iOS Safari.

## Features

### 🎯 Design-First Approach
- Modern, beautiful interface with attention to detail
- Smooth animations and transitions
- Responsive design that works on all devices
- Dark mode support
- Gradient backgrounds and modern typography

### 📱 Mobile Optimized
- Reliable autoplay with `muted` and `playsinline` attributes
- Touch-friendly controls
- Optimized for iOS Safari autoplay restrictions
- Responsive layout for all screen sizes

### 🔗 Easy Sharing
- Generate shareable links with base64-encoded URLs
- Copy-to-clipboard functionality
- URL obfuscation for basic protection
- Support for direct URL parameters

### 🎬 Multiple Viewing Modes
- **Standalone Player**: Full-featured player with controls and information
- **Embed Mode**: Minimal iframe-ready player for embedding
- **Main Interface**: URL input with validation and sharing

## Quick Start

1. **Open the application** by opening `index.html` in your browser
2. **Paste a stream URL** (supports HLS, DASH, and other streaming formats)
3. **Choose your viewing mode**:
   - Click "Open Player" for the full-featured player
   - Click "Open Embed" for iframe embedding
4. **Share the link** using the generated shareable URL

## File Structure

```
├── index.html          # Main application interface
├── player.html         # Standalone player page
├── embed.html          # Embed iframe page
├── app.js             # Main application logic
├── player.js          # Player page functionality
├── embed.js           # Embed page functionality
├── shared.js          # Shared utility functions
├── styles.css         # Comprehensive styling
└── README.md          # This documentation
```

## Usage

### Main Interface (`index.html`)

The main page provides:
- URL input with validation
- Real-time URL validation
- Share link generation
- Feature showcase

### Standalone Player (`player.html`)

Full-featured player with:
- Video controls (play/pause, volume, fullscreen)
- Stream information display
- Error handling and retry functionality
- Keyboard shortcuts
- Loading states

**Keyboard Shortcuts:**
- `Space` - Play/Pause
- `M` - Mute/Unmute
- `F` - Toggle Fullscreen
- `←/→` - Seek 10 seconds
- `Escape` - Exit Fullscreen

### Embed Mode (`embed.html`)

Minimal player for iframe embedding:
- Clean, distraction-free interface
- Automatic playback (muted)
- Error handling
- PostMessage API support for external control

## URL Format

The application supports various streaming formats:
- HLS (.m3u8)
- DASH (.mpd)
- Direct video files (.mp4, .webm, etc.)
- Any URL that browsers can play

### Share Link Format

Share links use base64 encoding for URL obfuscation:
```
https://yourdomain.com/?b64=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdHJlYW0ubTN1OA==
```

**Note**: This is basic obfuscation only. For real protection, consider using signed URLs.

## Technical Details

### Autoplay Compatibility

The player is specifically designed for reliable autoplay across browsers:

```html
<video 
    controls
    muted
    playsinline
    autoplay
    preload="metadata"
>
```

### iOS Safari Optimization

- Uses `muted` attribute for autoplay
- Implements `playsinline` for inline playback
- Starts with volume at 0 for user control
- Graceful fallback for autoplay restrictions

### Browser Support

- **Modern Browsers**: Full support with autoplay
- **iOS Safari**: Optimized autoplay with muted start
- **Mobile Browsers**: Touch-friendly controls
- **Desktop**: Full keyboard shortcuts and controls

## Embedding

### Basic Embed

```html
<iframe 
    src="embed.html?b64=aHR0cHM6Ly9leGFtcGxlLmNvbS9zdHJlYW0ubTN1OA=="
    width="100%" 
    height="400" 
    frameborder="0"
    allowfullscreen
></iframe>
```

### Programmatic Control

The embed player supports postMessage API for external control:

```javascript
// Send messages to the embed player
const iframe = document.querySelector('iframe');
const playerWindow = iframe.contentWindow;

// Play
playerWindow.postMessage({ type: 'play' }, '*');

// Pause
playerWindow.postMessage({ type: 'pause' }, '*');

// Mute/Unmute
playerWindow.postMessage({ type: 'mute' }, '*');
playerWindow.postMessage({ type: 'unmute' }, '*');

// Set volume (0-1)
playerWindow.postMessage({ type: 'setVolume', data: { volume: 0.5 } }, '*');

// Seek to time (seconds)
playerWindow.postMessage({ type: 'seek', data: { time: 30 } }, '*');
```

## Customization

### Styling

The application uses CSS custom properties for easy theming:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #64748b;
    --bg-primary: #ffffff;
    --text-primary: #1e293b;
    /* ... more variables */
}
```

### Adding Example URLs

Uncomment the example URL button in `app.js`:

```javascript
// Uncomment the line below to add an example URL button for testing
addExampleUrlButton();
```

## Security Considerations

1. **URL Obfuscation**: Base64 encoding provides basic obfuscation only
2. **Network Visibility**: URLs are still visible in network tools
3. **Signed URLs**: Consider implementing signed URLs for real protection
4. **CORS**: Ensure your streaming URLs support CORS if needed

## Browser Compatibility

| Browser | Autoplay | Fullscreen | HLS Support |
|---------|----------|------------|-------------|
| Chrome | ✅ | ✅ | ✅ (native) |
| Firefox | ✅ | ✅ | ✅ (native) |
| Safari | ✅ (muted) | ✅ | ✅ (native) |
| Edge | ✅ | ✅ | ✅ (native) |
| iOS Safari | ✅ (muted) | ✅ | ✅ (native) |

## Development

### Local Development

1. Clone or download the files
2. Open `index.html` in a web browser
3. For testing, use the example URLs provided in the code

### Testing Stream URLs

The application includes several test streams:
- `https://cdn.jwplayer.com/manifests/PESQNF4x.m3u8`
- `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`
- `https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8`

### Building for Production

The application is ready for production use. For deployment:

1. Upload all files to your web server
2. Ensure proper MIME types for `.js` and `.css` files
3. Consider enabling HTTPS for better autoplay support
4. Test on target devices and browsers

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify your stream URL is accessible
3. Test with the provided example URLs
4. Ensure your browser supports the streaming format

---

Built with ❤️ for reliable media playback

